import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customer_name, material_grade, net_tonnes } = await req.json();

        if (!customer_name || net_tonnes === undefined) {
            return Response.json({ error: 'customer_name and net_tonnes are required' }, { status: 400 });
        }

        // Fetch contract approval rules for this customer
        const contracts = await base44.asServiceRole.entities.ContractApproval.filter({
            customer_name: customer_name.toUpperCase()
        });

        const flags = [];
        let requiresManualReview = false;

        if (contracts.length === 0) {
            flags.push({
                type: 'no_contract',
                severity: 'warning',
                message: `No contract found for customer "${customer_name}". Docket flagged for manual review.`
            });
            requiresManualReview = true;
        } else {
            const contract = contracts[0];

            // Check if material grade is approved
            if (material_grade && contract.approved_material_grades && contract.approved_material_grades.length > 0) {
                const isApproved = contract.approved_material_grades.some(
                    grade => grade.toUpperCase() === material_grade.toUpperCase()
                );
                if (!isApproved) {
                    flags.push({
                        type: 'unapproved_material',
                        severity: 'error',
                        message: `Material grade "${material_grade}" is not on the approved list for this customer. Approved grades: ${contract.approved_material_grades.join(', ')}`
                    });
                    requiresManualReview = true;
                }
            } else if (!material_grade) {
                flags.push({
                    type: 'missing_material_grade',
                    severity: 'warning',
                    message: 'Material grade is missing. Cannot verify against approved list.'
                });
                requiresManualReview = true;
            }

            // Check tonnage limits
            if (contract.max_tonnage && net_tonnes > contract.max_tonnage) {
                flags.push({
                    type: 'exceeds_max_tonnage',
                    severity: 'error',
                    message: `Net tonnage (${net_tonnes}) exceeds maximum allowed (${contract.max_tonnage})`
                });
                requiresManualReview = true;
            }

            if (contract.min_tonnage && net_tonnes < contract.min_tonnage) {
                flags.push({
                    type: 'below_min_tonnage',
                    severity: 'warning',
                    message: `Net tonnage (${net_tonnes}) is below minimum (${contract.min_tonnage})`
                });
                requiresManualReview = true;
            }

            // Check tolerance if threshold values exist
            if (contract.tolerance_percentage && contract.max_tonnage) {
                const tolerance = (contract.max_tonnage * contract.tolerance_percentage) / 100;
                if (net_tonnes > contract.max_tonnage - tolerance) {
                    flags.push({
                        type: 'near_tolerance_threshold',
                        severity: 'info',
                        message: `Load is within ${contract.tolerance_percentage}% tolerance of maximum weight.`
                    });
                }
            }

            if (contract.requires_manual_review) {
                requiresManualReview = true;
            }
        }

        // Check if material grade is missing
        if (!material_grade) {
            flags.push({
                type: 'missing_material_grade',
                severity: 'warning',
                message: 'Material grade is required for docket processing.'
            });
            requiresManualReview = true;
        }

        return Response.json({
            flags,
            requiresManualReview,
            canProceed: flags.filter(f => f.severity === 'error').length === 0
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
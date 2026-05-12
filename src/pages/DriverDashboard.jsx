import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DriverDashboard() {
  const [assignedJobs, setAssignedJobs] = useState([]);

  const { data: schedules } = useQuery({
    queryKey: ['driver-schedules'],
    queryFn: () => base44.entities.Schedule.list('-updated_date', 100),
    initialData: [],
  });

  const { data: dockets } = useQuery({
    queryKey: ['driver-dockets'],
    queryFn: () => base44.entities.DriverDocket.list('-updated_date', 100),
    initialData: [],
  });

  useEffect(() => {
    const jobs = schedules.map(s => {
      const docket = dockets.find(d => d.schedule_id === s.job_id);
      return {
        ...s,
        docket_status: docket?.status || 'Not Started'
      };
    });
    setAssignedJobs(jobs);
  }, [schedules, dockets]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-[#1B7A45]" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-[#1E4D99]" />;
      default: return <AlertCircle className="w-5 h-5 text-[#AAB0C4]" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Jobs</span>
          </div>
          <Truck className="w-5 h-5 text-[#1E4D99]" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--mx-text)' }}>YOUR ASSIGNED JOBS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mx-muted)' }}>
            {assignedJobs.length} job{assignedJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedJobs.map((job) => (
            <Link to="/driver" key={job.job_id}>
              <div className="rounded-[14px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5 hover:shadow-[0_20px_60px_rgba(11,25,41,0.18)] transition-shadow cursor-pointer h-full">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Job ID</p>
                    <p className="text-lg font-black text-[#1E4D99]">{job.job_id}</p>
                  </div>
                  {getStatusIcon(job.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--mx-muted)' }}>Driver</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--mx-text)' }}>{job.driver_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--mx-muted)' }}>Client</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--mx-text)' }}>{job.client_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--mx-muted)' }}>Material</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--mx-text)' }}>{job.expected_material}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${
                      job.status === 'Completed' ? 'bg-[#EDFBF3] text-[#1B7A45]' :
                      job.status === 'In Progress' ? 'bg-[#EFF4FF] text-[#1E4D99]' :
                      'bg-[#F5F7FB] text-[#7A8898]'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${
                    job.docket_status === 'Verified' ? 'bg-[#EDFBF3] text-[#1B7A45]' :
                    job.docket_status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-[#F5F7FB] text-[#7A8898]'
                  }`}>
                    {job.docket_status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {assignedJobs.length === 0 && (
          <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-8 text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 text-[#EAEEF5]" />
            <p className="text-lg font-bold" style={{ color: 'var(--mx-text)' }}>No jobs assigned yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--mx-muted)' }}>Check back later for new assignments</p>
          </div>
        )}
      </main>
    </div>
  );
}
import { useState } from 'react';
import { Send, Copy, CheckCheck } from 'lucide-react';
import type { Coach, InviteStatus } from '../../types';
import clsx from 'clsx';

interface CoachInviteButtonProps {
  coach: Coach;
  onInvite: (updated: Coach) => void;
}

const STATUS_STYLES: Record<InviteStatus, string> = {
  'Not Invited': 'bg-slate-100 text-slate-600',
  'Invited':     'bg-yellow-100 text-yellow-700',
  'Active':      'bg-green-100 text-green-700',
};

export default function CoachInviteButton({ coach, onInvite }: CoachInviteButtonProps) {
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/set-password?phone=${coach.phone}`;

  const handleSendInvite = () => {
    onInvite({ ...coach, inviteStatus: 'Invited' });
    setShowLink(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Status badge */}
        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[coach.inviteStatus])}>
          {coach.inviteStatus}
        </span>

        {/* Action button */}
        {coach.inviteStatus === 'Not Invited' && (
          <button
            onClick={handleSendInvite}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium"
          >
            <Send size={11} /> Send Invite
          </button>
        )}
        {coach.inviteStatus === 'Invited' && !showLink && (
          <button
            onClick={() => setShowLink(true)}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            View link
          </button>
        )}
      </div>

      {/* Invite link */}
      {showLink && coach.inviteStatus !== 'Active' && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-slate-500 truncate flex-1">{inviteLink}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 flex-shrink-0"
          >
            {copied ? <CheckCheck size={12} className="text-green-600" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}

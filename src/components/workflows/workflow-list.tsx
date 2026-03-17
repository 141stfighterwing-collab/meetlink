'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Bell,
  Clock,
  Zap,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Workflow as WorkflowType } from '@/types';

interface WorkflowItem extends WorkflowType {
  triggerLabel: string;
  actionLabel: string;
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Booking Confirmation Email',
    description: 'Send confirmation email when a booking is created',
    isActive: true,
    triggerType: 'BOOKING_CREATED',
    triggerLabel: 'When a booking is created',
    triggerConfig: null,
    actions: '[{"type":"EMAIL","template":"confirmation"}]',
    actionLabel: 'Send confirmation email',
    eventTypeIds: ['1', '2'],
    executions: 127,
    lastExecutedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(2025, 1, 1),
    updatedAt: new Date(2025, 2, 1),
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Reminder 24h Before',
    description: 'Send reminder email 24 hours before the meeting',
    isActive: true,
    triggerType: 'BEFORE_EVENT',
    triggerLabel: '24 hours before event',
    triggerConfig: '{"hours":24}',
    actions: '[{"type":"EMAIL","template":"reminder"}]',
    actionLabel: 'Send reminder email',
    eventTypeIds: null,
    executions: 89,
    lastExecutedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(2025, 1, 15),
    updatedAt: new Date(2025, 2, 5),
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Follow-up After Meeting',
    description: 'Send follow-up email 2 hours after the meeting ends',
    isActive: false,
    triggerType: 'AFTER_EVENT',
    triggerLabel: '2 hours after event',
    triggerConfig: '{"hours":2}',
    actions: '[{"type":"EMAIL","template":"followup"}]',
    actionLabel: 'Send follow-up email',
    eventTypeIds: ['1'],
    executions: 45,
    lastExecutedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2025, 2, 1),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: '4',
    userId: 'user-1',
    name: 'No-show Alert',
    description: 'Notify host when invitee doesn\'t show up',
    isActive: true,
    triggerType: 'AFTER_EVENT',
    triggerLabel: '15 minutes after event start (no check-in)',
    triggerConfig: '{"minutes":15,"noShow":true}',
    actions: '[{"type":"NOTIFICATION","channel":"push"},{"type":"EMAIL","to":"host"}]',
    actionLabel: 'Send notification + email to host',
    eventTypeIds: null,
    executions: 12,
    lastExecutedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2025, 2, 5),
    updatedAt: new Date(2025, 2, 5),
  },
];

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const duplicateWorkflow = (workflow: WorkflowItem) => {
    const newWorkflow: WorkflowItem = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Copy)`,
      executions: 0,
      lastExecutedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkflows((prev) => [...prev, newWorkflow]);
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return <Zap className="h-4 w-4 text-emerald-600" />;
      case 'BOOKING_CONFIRMED':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'BOOKING_CANCELLED':
        return <Mail className="h-4 w-4 text-red-600" />;
      case 'BEFORE_EVENT':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'AFTER_EVENT':
        return <ArrowRight className="h-4 w-4 text-purple-600" />;
      default:
        return <Zap className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Workflows</h2>
          <p className="text-sm text-slate-500 mt-1">
            Automate actions based on booking events
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            setEditingWorkflow(null);
            setShowWorkflowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      workflow.isActive ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}
                  >
                    <Workflow
                      className={`h-6 w-6 ${
                        workflow.isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-800">{workflow.name}</h3>
                      <Badge
                        className={
                          workflow.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }
                      >
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{workflow.description}</p>

                    {/* Workflow Flow */}
                    <div className="flex items-center space-x-3 mt-4">
                      {/* Trigger */}
                      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-lg">
                        {getTriggerIcon(workflow.triggerType)}
                        <span className="text-sm font-medium text-slate-700">
                          {workflow.triggerLabel}
                        </span>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-400" />

                      {/* Action */}
                      <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 rounded-lg">
                        <Mail className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {workflow.actionLabel}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mt-4 text-sm text-slate-500">
                      <span>{workflow.executions} executions</span>
                      {workflow.lastExecutedAt && (
                        <span>
                          Last run:{' '}
                          {formatDistanceToNow(workflow.lastExecutedAt, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workflow.isActive}
                    onCheckedChange={() => toggleWorkflow(workflow.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingWorkflow(workflow);
                          setShowWorkflowModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateWorkflow(workflow)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No workflows created yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowWorkflowModal(true)}
              >
                Create your first workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workflow Modal */}
      <Dialog
        open={showWorkflowModal}
        onOpenChange={(open) => {
          setShowWorkflowModal(open);
          if (!open) setEditingWorkflow(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input
                placeholder="e.g., Booking Confirmation Email"
                defaultValue={editingWorkflow?.name}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this workflow do?"
                defaultValue={editingWorkflow?.description}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select defaultValue={editingWorkflow?.triggerType || 'BOOKING_CREATED'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOKING_CREATED">When a booking is created</SelectItem>
                  <SelectItem value="BOOKING_CONFIRMED">When a booking is confirmed</SelectItem>
                  <SelectItem value="BOOKING_CANCELLED">When a booking is cancelled</SelectItem>
                  <SelectItem value="BEFORE_EVENT">Before the event starts</SelectItem>
                  <SelectItem value="AFTER_EVENT">After the event ends</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <Select defaultValue="EMAIL">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Send email</SelectItem>
                  <SelectItem value="SMS">Send SMS</SelectItem>
                  <SelectItem value="NOTIFICATION">Send notification</SelectItem>
                  <SelectItem value="WEBHOOK">Call webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Apply to Event Types</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  <SelectItem value="selected">Selected Event Types</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowModal(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              {editingWorkflow ? 'Save Changes' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { EventType } from '@/types';

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventType | null;
  onSave: (event: EventType) => void;
}

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

const defaultFormData: Partial<EventType> = {
  name: '',
  slug: '',
  description: '',
  color: '#10B981',
  duration: 30,
  type: 'ONE_ON_ONE',
  bufferBefore: 0,
  bufferAfter: 0,
  dailyLimit: null,
  weeklyLimit: null,
  minBookingNotice: 2,
  maxBookingWindow: 30,
  locationType: 'VIDEO',
  videoProvider: 'ZOOM',
  autoGenerateVideo: true,
  requiresConfirmation: false,
  allowRescheduling: true,
  allowCancellation: true,
  cancellationWindow: 24,
  maxAttendees: null,
  seatsPerSlot: 1,
  isActive: true,
  isPublic: true,
};

export function EventForm({ open, onOpenChange, event, onSave }: EventFormProps) {
  // Use event data as initial state, or default if no event
  const initialData = useMemo(() => {
    return event ? { ...defaultFormData, ...event } : defaultFormData;
  }, [event]);

  const [formData, setFormData] = useState<Partial<EventType>>(initialData);

  // Reset form when dialog opens with new event
  const dialogKey = event?.id || 'new';

  const handleChange = (field: keyof EventType, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = () => {
    const slug = formData.slug || generateSlug(formData.name || '');
    onSave({
      ...formData,
      slug,
      totalBookings: event?.totalBookings || 0,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date(),
    } as EventType);
  };

  // Reset form when opening with different event
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(event ? { ...defaultFormData, ...event } : defaultFormData);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent key={dialogKey} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event Type' : 'Create Event Type'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange('name', e.target.value);
                    if (!event) {
                      handleChange('slug', generateSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g., 30 Minute Meeting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="e.g., 30min"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this event type"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-slate-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange('color', color)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_ON_ONE">One-on-One</SelectItem>
                    <SelectItem value="GROUP">Group</SelectItem>
                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                    <SelectItem value="COLLECTIVE">Collective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration?.toString()}
                  onValueChange={(value) => handleChange('duration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.type === 'GROUP' || formData.type === 'ROUND_ROBIN') && (
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees || ''}
                  onChange={(e) => handleChange('maxAttendees', parseInt(e.target.value))}
                  placeholder="e.g., 10"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleChange('isPublic', checked)}
                />
                <Label>Public</Label>
              </div>
            </div>
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Buffer Times</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bufferBefore">Buffer Before (minutes)</Label>
                    <Input
                      id="bufferBefore"
                      type="number"
                      value={formData.bufferBefore}
                      onChange={(e) => handleChange('bufferBefore', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bufferAfter">Buffer After (minutes)</Label>
                    <Input
                      id="bufferAfter"
                      type="number"
                      value={formData.bufferAfter}
                      onChange={(e) => handleChange('bufferAfter', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Booking Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={formData.dailyLimit || ''}
                      onChange={(e) => handleChange('dailyLimit', parseInt(e.target.value) || null)}
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyLimit">Weekly Limit</Label>
                    <Input
                      id="weeklyLimit"
                      type="number"
                      value={formData.weeklyLimit || ''}
                      onChange={(e) => handleChange('weeklyLimit', parseInt(e.target.value) || null)}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Booking Window</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minBookingNotice">Minimum Notice (hours)</Label>
                    <Input
                      id="minBookingNotice"
                      type="number"
                      value={formData.minBookingNotice}
                      onChange={(e) => handleChange('minBookingNotice', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBookingWindow">Max Future (days)</Label>
                    <Input
                      id="maxBookingWindow"
                      type="number"
                      value={formData.maxBookingWindow}
                      onChange={(e) => handleChange('maxBookingWindow', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="locationType">Location Type</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) => handleChange('locationType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video Call</SelectItem>
                  <SelectItem value="PHONE">Phone Call</SelectItem>
                  <SelectItem value="IN_PERSON">In-Person</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.locationType === 'VIDEO' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoProvider">Video Provider</Label>
                  <Select
                    value={formData.videoProvider}
                    onValueChange={(value) => handleChange('videoProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZOOM">Zoom</SelectItem>
                      <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                      <SelectItem value="TEAMS">Microsoft Teams</SelectItem>
                      <SelectItem value="CUSTOM">Custom Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.autoGenerateVideo}
                    onCheckedChange={(checked) => handleChange('autoGenerateVideo', checked)}
                  />
                  <Label>Auto-generate video link</Label>
                </div>
              </div>
            )}

            {formData.locationType === 'IN_PERSON' && (
              <div className="space-y-2">
                <Label htmlFor="locationDetails">Address</Label>
                <Textarea
                  id="locationDetails"
                  value={formData.locationDetails || ''}
                  onChange={(e) => handleChange('locationDetails', e.target.value)}
                  placeholder="Enter the meeting address"
                  rows={2}
                />
              </div>
            )}

            {formData.locationType === 'CUSTOM' && (
              <div className="space-y-2">
                <Label htmlFor="locationDetails">Location Details</Label>
                <Textarea
                  id="locationDetails"
                  value={formData.locationDetails || ''}
                  onChange={(e) => handleChange('locationDetails', e.target.value)}
                  placeholder="Enter custom location details or link"
                  rows={2}
                />
              </div>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Confirmation & Rescheduling</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Requires Confirmation</Label>
                    <Switch
                      checked={formData.requiresConfirmation}
                      onCheckedChange={(checked) => handleChange('requiresConfirmation', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow Rescheduling</Label>
                    <Switch
                      checked={formData.allowRescheduling}
                      onCheckedChange={(checked) => handleChange('allowRescheduling', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow Cancellation</Label>
                    <Switch
                      checked={formData.allowCancellation}
                      onCheckedChange={(checked) => handleChange('allowCancellation', checked)}
                    />
                  </div>
                  {formData.allowCancellation && (
                    <div className="space-y-2">
                      <Label htmlFor="cancellationWindow">Cancellation Window (hours before)</Label>
                      <Input
                        id="cancellationWindow"
                        type="number"
                        value={formData.cancellationWindow}
                        onChange={(e) => handleChange('cancellationWindow', parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {formData.type === 'ROUND_ROBIN' && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-medium">Round Robin Strategy</h4>
                  <Select
                    value={formData.roundRobinStrategy || 'ROUND_ROBIN'}
                    onValueChange={(value) => handleChange('roundRobinStrategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUND_ROBIN">Round Robin (rotate hosts)</SelectItem>
                      <SelectItem value="LEAST_BOOKED">Least Booked (balance load)</SelectItem>
                      <SelectItem value="RANDOM">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
            {event ? 'Save Changes' : 'Create Event Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

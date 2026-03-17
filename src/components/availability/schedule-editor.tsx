'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Globe,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const defaultSchedule: ScheduleSlot[] = [
  { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
  { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
];

interface DateOverride {
  id: string;
  date: Date;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export function ScheduleEditor() {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(defaultSchedule);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [timezone, setTimezone] = useState('America/New_York');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  const toggleSlot = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const updateSlotTime = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addScheduleSlot = (dayOfWeek: number) => {
    const existing = schedules.filter((s) => s.dayOfWeek === dayOfWeek);
    const newSlot: ScheduleSlot = {
      id: Date.now().toString(),
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    };
    setSchedules((prev) => [...prev, newSlot]);
  };

  const removeSlot = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const getSlotsForDay = (day: number) => {
    return schedules.filter((s) => s.dayOfWeek === day);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Availability</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure your weekly schedule and date overrides
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-slate-400" />
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowOverrideModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Override
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="overrides">Date Overrides</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule */}
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Availability</CardTitle>
              <p className="text-sm text-slate-500">
                Set your regular availability for each day of the week
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {daysOfWeek.map((day, index) => {
                  const daySlots = getSlotsForDay(index);
                  const hasSlots = daySlots.length > 0;

                  return (
                    <div key={day} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-24">
                            <p className="font-medium text-slate-800">{day}</p>
                          </div>
                          <Switch
                            checked={hasSlots && daySlots.some((s) => s.isActive)}
                            onCheckedChange={(checked) => {
                              if (checked && !hasSlots) {
                                addScheduleSlot(index);
                              } else if (!checked) {
                                setSchedules((prev) =>
                                  prev.map((s) =>
                                    s.dayOfWeek === index ? { ...s, isActive: false } : s
                                  )
                                );
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1 max-w-xl">
                          {hasSlots ? (
                            <div className="space-y-2">
                              {daySlots.map((slot) => (
                                <div key={slot.id} className="flex items-center space-x-2">
                                  <Input
                                    type="time"
                                    className="w-32"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                      updateSlotTime(slot.id, 'startTime', e.target.value)
                                    }
                                  />
                                  <span className="text-slate-400">to</span>
                                  <Input
                                    type="time"
                                    className="w-32"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                      updateSlotTime(slot.id, 'endTime', e.target.value)
                                    }
                                  />
                                  {daySlots.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeSlot(slot.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  )}
                                  <Badge
                                    variant={slot.isActive ? 'default' : 'secondary'}
                                    className={
                                      slot.isActive ? 'bg-emerald-100 text-emerald-700' : ''
                                    }
                                  >
                                    {slot.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addScheduleSlot(index)}
                                className="text-emerald-600"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add time slot
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addScheduleSlot(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add availability
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Date Overrides */}
        <TabsContent value="overrides">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date Overrides</CardTitle>
              <p className="text-sm text-slate-500">
                Add exceptions for specific dates (holidays, time off, special hours)
              </p>
            </CardHeader>
            <CardContent>
              {overrides.length > 0 ? (
                <div className="space-y-3">
                  {overrides.map((override) => (
                    <div
                      key={override.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            override.isAvailable
                              ? 'bg-emerald-100'
                              : 'bg-red-100'
                          }`}
                        >
                          {override.isAvailable ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {format(override.date, 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-slate-500">
                            {override.isAvailable
                              ? `${override.startTime} - ${override.endTime}`
                              : 'Unavailable'}
                          </p>
                          {override.reason && (
                            <p className="text-xs text-slate-400">{override.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOverrides((prev) => prev.filter((o) => o.id !== override.id))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No date overrides configured</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowOverrideModal(true)}
                  >
                    Add your first override
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Override Modal */}
      <Dialog open={showOverrideModal} onOpenChange={setShowOverrideModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Date Override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="available" defaultChecked />
              <Label htmlFor="available">Available on this date</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" defaultValue="17:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input placeholder="e.g., Holiday, Vacation, Special hours" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                const newOverride: DateOverride = {
                  id: Date.now().toString(),
                  date: addDays(new Date(), 5),
                  isAvailable: false,
                  reason: 'Holiday',
                };
                setOverrides((prev) => [...prev, newOverride]);
                setShowOverrideModal(false);
              }}
            >
              Add Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

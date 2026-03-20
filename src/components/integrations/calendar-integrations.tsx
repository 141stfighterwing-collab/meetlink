'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Video,
  ExternalLink,
  Plus,
  Settings,
  AlertCircle,
  Clock,
  Link2,
} from 'lucide-react';

interface CalendarIntegration {
  id: string;
  provider: 'GOOGLE' | 'OUTLOOK' | 'ICAL' | 'CALDAV';
  name: string;
  email?: string;
  calendarId?: string;
  color: string;
  isConnected: boolean;
  lastSync?: Date;
  syncEnabled: boolean;
  checkAvailability: boolean;
  addEventsToCalendar: boolean;
  errorMessage?: string;
}

const integrations: CalendarIntegration[] = [
  {
    id: '1',
    provider: 'GOOGLE',
    name: 'Google Calendar',
    email: 'john.doe@company.com',
    color: '#4285F4',
    isConnected: true,
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    syncEnabled: true,
    checkAvailability: true,
    addEventsToCalendar: true,
  },
  {
    id: '2',
    provider: 'OUTLOOK',
    name: 'Outlook Calendar',
    email: 'john.doe@company.com',
    color: '#0078D4',
    isConnected: false,
    syncEnabled: false,
    checkAvailability: false,
    addEventsToCalendar: false,
  },
];

interface VideoIntegration {
  id: string;
  provider: 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET';
  name: string;
  email?: string;
  isConnected: boolean;
  autoGenerate: boolean;
}

const videoIntegrations: VideoIntegration[] = [
  {
    id: '1',
    provider: 'ZOOM',
    name: 'Zoom',
    email: 'john.doe@company.com',
    isConnected: true,
    autoGenerate: true,
  },
  {
    id: '2',
    provider: 'TEAMS',
    name: 'Microsoft Teams',
    isConnected: false,
    autoGenerate: false,
  },
  {
    id: '3',
    provider: 'GOOGLE_MEET',
    name: 'Google Meet',
    email: 'john.doe@company.com',
    isConnected: true,
    autoGenerate: true,
  },
];

export function CalendarIntegrations() {
  const [calendars, setCalendars] = useState<CalendarIntegration[]>(integrations);
  const [videoApps, setVideoApps] = useState<VideoIntegration[]>(videoIntegrations);
  const [showIcalModal, setShowIcalModal] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');

  const updateCalendar = (id: string, updates: Partial<CalendarIntegration>) => {
    setCalendars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const updateVideoApp = (id: string, updates: Partial<VideoIntegration>) => {
    setVideoApps((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'GOOGLE':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'OUTLOOK':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'ZOOM':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'TEAMS':
        return (
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
        );
      case 'GOOGLE_MEET':
        return (
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Video className="h-5 w-5 text-green-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-slate-600" />
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Integrations</h2>
        <p className="text-sm text-slate-500 mt-1">
          Connect your calendars and video conferencing tools
        </p>
      </div>

      <div className="space-y-8">
        {/* Calendar Integrations */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Calendar Sync</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendars.map((calendar) => (
              <Card key={calendar.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(calendar.provider)}
                      <div>
                        <h4 className="font-medium text-slate-800">{calendar.name}</h4>
                        {calendar.email && (
                          <p className="text-sm text-slate-500">{calendar.email}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={
                        calendar.isConnected
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }
                    >
                      {calendar.isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>

                  {calendar.isConnected ? (
                    <div className="space-y-4">
                      {/* Sync Status */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-500">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Last sync: {calendar.lastSync?.toLocaleTimeString() || 'Never'}
                        </div>
                        <Button variant="ghost" size="sm">
                          Sync Now
                        </Button>
                      </div>

                      {/* Settings */}
                      <div className="space-y-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Check availability</span>
                          <Switch
                            checked={calendar.checkAvailability}
                            onCheckedChange={(checked) =>
                              updateCalendar(calendar.id, { checkAvailability: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Add events to calendar</span>
                          <Switch
                            checked={calendar.addEventsToCalendar}
                            onCheckedChange={(checked) =>
                              updateCalendar(calendar.id, { addEventsToCalendar: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Sync enabled</span>
                          <Switch
                            checked={calendar.syncEnabled}
                            onCheckedChange={(checked) =>
                              updateCalendar(calendar.id, { syncEnabled: checked })
                            }
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-3 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect {calendar.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* iCal Feed */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">iCal Feed</h4>
                      <p className="text-sm text-slate-500">Subscribe to external calendars</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowIcalModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add iCal Feed
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Conferencing */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Video Conferencing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videoApps.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {getProviderIcon(app.provider)}
                    <div>
                      <h4 className="font-medium text-slate-800">{app.name}</h4>
                      {app.email && (
                        <p className="text-sm text-slate-500">{app.email}</p>
                      )}
                    </div>
                  </div>

                  {app.isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Auto-generate links</span>
                        <Switch
                          checked={app.autoGenerate}
                          onCheckedChange={(checked) =>
                            updateVideoApp(app.id, { autoGenerate: checked })
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CRM Integrations */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">CRM & Other Apps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Salesforce', 'HubSpot', 'Zapier'].map((crm) => (
              <Card key={crm}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{crm}</h4>
                      <p className="text-sm text-slate-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* iCal Modal */}
      <Dialog open={showIcalModal} onOpenChange={setShowIcalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add iCal Feed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Feed Name</Label>
              <Input placeholder="e.g., Team Calendar" />
            </div>
            <div className="space-y-2">
              <Label>iCal URL</Label>
              <Input
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                The iCal feed will be synced every 15 minutes. Only read access is supported.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIcalModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowIcalModal(false)}
            >
              Add Feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import {
  Globe,
  Shield,
  Key,
  Camera,
  Save,
  Mail,
  Phone,
} from 'lucide-react';

export function SettingsPanel() {
  const { user } = useAppStore();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 555-0100',
    company: 'Tech Solutions Inc.',
    jobTitle: 'Product Manager',
    bio: 'Experienced product manager passionate about building great products.',
    website: 'https://johndoe.com',
    timezone: 'America/New_York',
    locale: 'en',
  });

  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailBookingReminder: true,
    emailCancellation: true,
    emailDailySummary: false,
    smsBookingReminder: false,
    smsCancellation: true,
    pushNewBooking: true,
    pushCancellation: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account preferences and configurations
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
        <TabsList className="grid grid-cols-4 w-full h-9 md:h-10">
          <TabsTrigger value="profile" className="text-xs md:text-sm px-1 md:px-4">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm px-1 md:px-4 hidden sm:inline-flex">Alerts</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm px-1 md:px-4 sm:hidden">Alerts</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs md:text-sm px-1 md:px-4">Theme</TabsTrigger>
          <TabsTrigger value="security" className="text-xs md:text-sm px-1 md:px-4">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-3 md:mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-emerald-600 text-white text-xl md:text-2xl">
                    {profileData.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="h-8 md:h-9 text-xs md:text-sm">
                  <Camera className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Change Photo
                </Button>
                <div className="mt-4 md:mt-6 w-full space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-500">Plan</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] md:text-xs">Pro</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-500">Role</span>
                    <Badge variant="outline" className="text-[10px] md:text-xs">Admin</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-500">Member since</span>
                    <span className="text-slate-700 dark:text-slate-300">Jan 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base">Personal Information</CardTitle>
                <CardDescription className="text-xs md:text-sm">Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="name" className="text-xs md:text-sm">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="h-9 md:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="h-9 md:h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="phone" className="text-xs md:text-sm">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="h-9 md:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="company" className="text-xs md:text-sm">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, company: e.target.value }))
                      }
                      className="h-9 md:h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="jobTitle" className="text-xs md:text-sm">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profileData.jobTitle}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, jobTitle: e.target.value }))
                    }
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="bio" className="text-xs md:text-sm">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="website" className="text-xs md:text-sm">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, website: e.target.value }))
                    }
                    className="h-9 md:h-10 text-sm"
                  />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10 text-sm">
                  <Save className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Regional Settings */}
          <Card className="mt-4 md:mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base flex items-center">
                <Globe className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Timezone</Label>
                  <Select
                    value={profileData.timezone}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger className="h-9 md:h-10 text-sm">
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
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Language</Label>
                  <Select
                    value={profileData.locale}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({ ...prev, locale: value }))
                    }
                  >
                    <SelectTrigger className="h-9 md:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="h-9 md:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">Notification Preferences</CardTitle>
              <CardDescription className="text-xs md:text-sm">Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white mb-3 md:mb-4 flex items-center text-sm md:text-base">
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  Email Notifications
                </h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Booking Confirmation</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Receive email when someone books a meeting
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBookingConfirmation}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailBookingConfirmation: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Booking Reminders</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Get reminders before your scheduled meetings
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBookingReminder}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailBookingReminder: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Cancellation Alerts</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Be notified when bookings are cancelled
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailCancellation}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailCancellation: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Daily Summary</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Receive daily digest of your schedule
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailDailySummary}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailDailySummary: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white mb-3 md:mb-4 flex items-center text-sm md:text-base">
                  <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  SMS Notifications
                </h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Booking Reminders</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Get SMS reminders before meetings
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsBookingReminder}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          smsBookingReminder: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Cancellation Alerts</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Be notified via SMS when bookings are cancelled
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsCancellation}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          smsCancellation: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 md:space-y-6">
          <ThemeSwitcher />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">Calendar Preferences</CardTitle>
              <CardDescription className="text-xs md:text-sm">Configure your calendar display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div>
                <Label className="text-xs md:text-sm font-medium">Default Calendar View</Label>
                <p className="text-xs text-muted-foreground mb-2 md:mb-4">Choose your preferred calendar layout</p>
                <Select defaultValue="week">
                  <SelectTrigger className="w-full sm:w-48 h-9 md:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month View</SelectItem>
                    <SelectItem value="week">Week View</SelectItem>
                    <SelectItem value="day">Day View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-xs md:text-sm font-medium">Time Format</Label>
                <p className="text-xs text-muted-foreground mb-2 md:mb-4">How times are displayed</p>
                <Select defaultValue="12h">
                  <SelectTrigger className="w-full sm:w-48 h-9 md:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-xs md:text-sm font-medium">Week Starts On</Label>
                <p className="text-xs text-muted-foreground mb-2 md:mb-4">First day of the week</p>
                <Select defaultValue="sunday">
                  <SelectTrigger className="w-full sm:w-48 h-9 md:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">Enable 2FA</Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Change Password</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">Change Password</Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Session Timeout</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Automatically log out after inactivity
                    </p>
                  </div>
                  <Select
                    value={security.sessionTimeout.toString()}
                    onValueChange={(value) =>
                      setSecurity((prev) => ({ ...prev, sessionTimeout: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-32 h-9 md:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base flex items-center">
                  <Key className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  API Keys
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Manage API keys for integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Production Key</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">mlk_****_****_****_********</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Created Jan 15, 2025</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="h-7 md:h-8 text-xs">
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 h-7 md:h-8 text-xs">
                        Revoke
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm">
                    <Key className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Generate New API Key
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm">Export Data</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">Export</Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-red-600 text-xs md:text-sm">Delete Account</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

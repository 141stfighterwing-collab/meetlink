'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Building,
  Download,
  Upload,
  Users,
  Link2,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Contact, ContactGroup } from '@/types';

const mockContacts: Contact[] = [
  {
    id: '1',
    userId: 'user-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 555-0101',
    company: 'TechCorp Inc.',
    jobTitle: 'CTO',
    website: 'https://techcorp.com',
    linkedin: 'linkedin.com/in/sarahjohnson',
    notes: 'Interested in enterprise plan',
    source: 'BOOKING',
    totalBookings: 5,
    lastBookingAt: new Date(2025, 2, 15),
    createdAt: new Date(2025, 1, 1),
    updatedAt: new Date(2025, 2, 15),
  },
  {
    id: '2',
    userId: 'user-1',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@startup.io',
    phone: '+1 555-0102',
    company: 'Startup.io',
    jobTitle: 'Founder',
    website: 'https://startup.io',
    notes: 'Prefers morning meetings',
    source: 'MANUAL',
    totalBookings: 3,
    lastBookingAt: new Date(2025, 2, 10),
    createdAt: new Date(2025, 1, 15),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: '3',
    userId: 'user-1',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@design.co',
    phone: '+1 555-0103',
    company: 'Design Co.',
    jobTitle: 'Creative Director',
    website: 'https://design.co',
    source: 'IMPORT',
    totalBookings: 2,
    lastBookingAt: new Date(2025, 2, 5),
    createdAt: new Date(2025, 2, 1),
    updatedAt: new Date(2025, 2, 5),
  },
  {
    id: '4',
    userId: 'user-1',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@enterprise.com',
    phone: '+1 555-0104',
    company: 'Enterprise Solutions',
    jobTitle: 'VP of Engineering',
    source: 'BOOKING',
    totalBookings: 8,
    lastBookingAt: new Date(2025, 2, 12),
    createdAt: new Date(2024, 12, 1),
    updatedAt: new Date(2025, 2, 12),
  },
  {
    id: '5',
    userId: 'user-1',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@agency.com',
    phone: '+1 555-0105',
    company: 'Creative Agency',
    jobTitle: 'Account Manager',
    source: 'CARDDAV',
    totalBookings: 1,
    lastBookingAt: new Date(2025, 2, 8),
    createdAt: new Date(2025, 2, 8),
    updatedAt: new Date(2025, 2, 8),
  },
];

const mockGroups: ContactGroup[] = [
  { id: '1', userId: 'user-1', name: 'VIP Clients', description: 'High-value clients', color: '#F59E0B', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', userId: 'user-1', name: 'Prospects', description: 'Potential customers', color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', userId: 'user-1', name: 'Partners', description: 'Business partners', color: '#8B5CF6', createdAt: new Date(), updatedAt: new Date() },
];

export function ContactList() {
  const { showContactModal, setShowContactModal, contactSearchQuery, setContactSearchQuery } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [groups] = useState<ContactGroup[]>(mockGroups);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showGroups, setShowGroups] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const query = contactSearchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContact(null);
  };

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      MANUAL: { label: 'Manual', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
      BOOKING: { label: 'Booking', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      IMPORT: { label: 'Import', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      CARDDAV: { label: 'CardDAV', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      API: { label: 'API', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    };
    const badge = badges[source] || badges.MANUAL;
    return <Badge className={`${badge.className} text-[10px] md:text-xs`}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">Contacts</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your contacts and contact groups
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">
            <Upload className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Import VCF</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button variant="outline" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0 hidden sm:flex">
            <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 h-8 md:h-9 text-xs md:text-sm flex-shrink-0"
            onClick={() => {
              setSelectedContact(null);
              setShowContactModal(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Add Contact</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-10 h-9 md:h-10 text-sm"
            value={contactSearchQuery}
            onChange={(e) => setContactSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-32 md:w-40 h-9 md:h-10 text-xs md:text-sm">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Mobile Groups Toggle */}
          <Button
            variant="outline"
            className="lg:hidden h-9 md:h-10 px-3"
            onClick={() => setShowGroups(!showGroups)}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Contact Groups Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Groups
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                  filterGroup === 'all' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setFilterGroup('all')}
              >
                <div className="flex items-center justify-between">
                  <span>All Contacts</span>
                  <Badge variant="outline" className="text-xs">{contacts.length}</Badge>
                </div>
              </button>
              {groups.map((group) => {
                const count = Math.floor(Math.random() * 10) + 1;
                return (
                  <button
                    key={group.id}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      filterGroup === group.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setFilterGroup(group.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span>{group.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* CardDAV Sync */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Link2 className="h-4 w-4 mr-2" />
                CardDAV Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sync Enabled</p>
                    <p className="text-xs text-slate-500">Last sync: 2 hours ago</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full text-sm h-8">
                  Configure CardDAV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Groups Panel */}
        {showGroups && (
          <div className="lg:hidden col-span-1">
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterGroup === 'all' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                    onClick={() => { setFilterGroup('all'); setShowGroups(false); }}
                  >
                    All ({contacts.length})
                  </button>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        filterGroup === group.id ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                      onClick={() => { setFilterGroup(group.id); setShowGroups(false); }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                      {group.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact List */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center p-3 md:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors gap-2 md:gap-0"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-600 text-white text-xs md:text-sm">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800 dark:text-white text-sm md:text-base truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {getSourceBadge(contact.source)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                        {contact.email && (
                          <span className="flex items-center truncate">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </span>
                        )}
                        {contact.company && (
                          <span className="hidden sm:flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                          {contact.totalBookings} bookings
                        </p>
                        {contact.lastBookingAt && (
                          <p className="text-[10px] md:text-xs text-slate-500">
                            Last: {format(contact.lastBookingAt, 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-slate-500 sm:hidden">{contact.totalBookings} bookings</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setSelectedContact(contact)} className="text-sm">
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm">
                              <Mail className="h-3.5 w-3.5 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm">
                              <Plus className="h-3.5 w-3.5 mr-2" />
                              Book Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 text-sm"
                              onClick={() => deleteContact(contact.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="h-4 w-4 text-slate-400 hidden sm:block" />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="p-6 md:p-8 text-center text-slate-500">
                    <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-slate-300" />
                    <p className="text-sm md:text-base">No contacts found</p>
                    <Button
                      variant="outline"
                      className="mt-3 md:mt-4 h-9 text-sm"
                      onClick={() => setShowContactModal(true)}
                    >
                      Add your first contact
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Detail/Edit Modal */}
      <Dialog
        open={showContactModal || !!selectedContact}
        onOpenChange={(open) => {
          setShowContactModal(open);
          if (!open) setSelectedContact(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">{selectedContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="firstName" className="text-xs md:text-sm">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={selectedContact?.firstName}
                  placeholder="John"
                  className="h-9 md:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="lastName" className="text-xs md:text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={selectedContact?.lastName}
                  placeholder="Doe"
                  className="h-9 md:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={selectedContact?.email}
                placeholder="john@company.com"
                className="h-9 md:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="phone" className="text-xs md:text-sm">Phone</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={selectedContact?.phone}
                placeholder="+1 555-0100"
                className="h-9 md:h-10 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="company" className="text-xs md:text-sm">Company</Label>
                <Input
                  id="company"
                  defaultValue={selectedContact?.company}
                  placeholder="Company Inc."
                  className="h-9 md:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="jobTitle" className="text-xs md:text-sm">Job Title</Label>
                <Input
                  id="jobTitle"
                  defaultValue={selectedContact?.jobTitle}
                  placeholder="CEO"
                  className="h-9 md:h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="website" className="text-xs md:text-sm">Website</Label>
              <Input
                id="website"
                type="url"
                defaultValue={selectedContact?.website}
                placeholder="https://company.com"
                className="h-9 md:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="notes" className="text-xs md:text-sm">Notes</Label>
              <Textarea
                id="notes"
                defaultValue={selectedContact?.notes || ''}
                placeholder="Additional notes about this contact..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowContactModal(false);
              setSelectedContact(null);
            }} className="w-full sm:w-auto h-9 text-sm">
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto h-9 text-sm">
              {selectedContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

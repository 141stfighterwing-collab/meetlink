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
  Phone,
  Building,
  Globe,
  Download,
  Upload,
  Users,
  Filter,
  Import,
  Export,
  Link2,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterGroup, setFilterGroup] = useState<string>('all');

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
      MANUAL: { label: 'Manual', className: 'bg-slate-100 text-slate-600' },
      BOOKING: { label: 'Booking', className: 'bg-emerald-100 text-emerald-700' },
      IMPORT: { label: 'Import', className: 'bg-blue-100 text-blue-700' },
      CARDDAV: { label: 'CardDAV', className: 'bg-purple-100 text-purple-700' },
      API: { label: 'API', className: 'bg-orange-100 text-orange-700' },
    };
    const badge = badges[source] || badges.MANUAL;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Contacts</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your contacts and contact groups
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import VCF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setSelectedContact(null);
              setShowContactModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={contactSearchQuery}
            onChange={(e) => setContactSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-40">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contact Groups Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Groups
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  filterGroup === 'all' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'
                }`}
                onClick={() => setFilterGroup('all')}
              >
                <div className="flex items-center justify-between">
                  <span>All Contacts</span>
                  <Badge variant="outline">{contacts.length}</Badge>
                </div>
              </button>
              {groups.map((group) => {
                const count = Math.floor(Math.random() * 10) + 1;
                return (
                  <button
                    key={group.id}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filterGroup === group.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setFilterGroup(group.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span>{group.name}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* CardDAV Sync */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Link2 className="h-4 w-4 mr-2" />
                CardDAV Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sync Enabled</p>
                    <p className="text-xs text-slate-500">Last sync: 2 hours ago</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full">
                  Configure CardDAV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact List */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-600 text-white">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-slate-800">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {getSourceBadge(contact.source)}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                        {contact.email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email}
                          </span>
                        )}
                        {contact.company && (
                          <span className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">
                          {contact.totalBookings} bookings
                        </p>
                        {contact.lastBookingAt && (
                          <p className="text-xs text-slate-500">
                            Last: {format(contact.lastBookingAt, 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="h-4 w-4 mr-2" />
                            Book Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteContact(contact.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No contacts found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={selectedContact?.firstName}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={selectedContact?.lastName}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={selectedContact?.email}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={selectedContact?.phone}
                placeholder="+1 555-0100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  defaultValue={selectedContact?.company}
                  placeholder="Company Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  defaultValue={selectedContact?.jobTitle}
                  placeholder="CEO"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                defaultValue={selectedContact?.website}
                placeholder="https://company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                defaultValue={selectedContact?.notes || ''}
                placeholder="Additional notes about this contact..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowContactModal(false);
              setSelectedContact(null);
            }}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              {selectedContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

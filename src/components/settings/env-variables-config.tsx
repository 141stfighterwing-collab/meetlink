'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Mail,
  Calendar,
  Shield,
  FileText,
} from 'lucide-react';

interface EnvVariable {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'number' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
}

interface EnvCategory {
  title: string;
  variables: EnvVariable[];
}

interface EnvSchema {
  [key: string]: EnvCategory;
}

interface EnvConfigProps {
  onSave?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  app: <Server className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  auth: <Shield className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  logging: <FileText className="h-4 w-4" />,
};

export function EnvVariablesConfig({ onSave }: EnvConfigProps) {
  const [schema, setSchema] = useState<EnvSchema | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [reloadDialogOpen, setReloadDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch environment configuration
  useEffect(() => {
    fetchEnvConfig();
  }, []);

  const fetchEnvConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config/env');
      const data = await response.json();
      
      if (data.success) {
        setSchema(data.schema);
        setValues(data.values || {});
        setOriginalValues(data.values || {});
      } else {
        setErrorMessage(data.error || 'Failed to load configuration');
      }
    } catch (error) {
      setErrorMessage('Failed to load environment configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasChanges = () => {
    return JSON.stringify(values) !== JSON.stringify(originalValues);
  };

  const handleSave = async (reload: boolean = false) => {
    try {
      setSaving(true);
      setErrorMessage('');
      
      const response = await fetch('/api/config/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values, reload }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOriginalValues({ ...values });
        setSaveStatus('success');
        
        if (reload) {
          setReloadDialogOpen(true);
        }
        
        onSave?.();
      } else {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Failed to save environment configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/config/env', { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        await fetchEnvConfig();
        setSaveStatus('success');
      } else {
        setErrorMessage(data.error || 'Failed to restore backup');
      }
    } catch (error) {
      setErrorMessage('Failed to restore backup');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (variable: EnvVariable) => {
    const value = values[variable.key] || '';
    const isPassword = variable.type === 'password';
    const showValue = showPassword[variable.key];

    switch (variable.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => handleValueChange(variable.key, checked.toString())}
            />
            <span className="text-sm text-slate-500">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleValueChange(variable.key, v)}>
            <SelectTrigger className="h-9 md:h-10">
              <SelectValue placeholder={`Select ${variable.label}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(variable.key, e.target.value)}
            placeholder={`Enter ${variable.label}`}
            className="h-9 md:h-10"
          />
        );
      
      default:
        return (
          <div className="relative">
            <Input
              type={isPassword && !showValue ? 'password' : variable.type === 'email' ? 'email' : 'text'}
              value={value}
              onChange={(e) => handleValueChange(variable.key, e.target.value)}
              placeholder={`Enter ${variable.label}`}
              className={`h-9 md:h-10 ${isPassword ? 'pr-10' : ''}`}
            />
            {isPassword && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 md:h-10 w-10"
                onClick={() => togglePasswordVisibility(variable.key)}
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading configuration...</span>
        </CardContent>
      </Card>
    );
  }

  if (!schema) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{errorMessage || 'Failed to load configuration schema'}</p>
          <Button variant="outline" className="mt-4" onClick={fetchEnvConfig}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Banner */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 md:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-400 text-sm">Configuration saved successfully. A restart may be required for changes to take effect.</span>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Warning Banner */}
      <div className="flex items-start gap-2 p-3 md:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangle className="h-4 md:h-5 w-4 md:w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400">Important</p>
          <p className="text-amber-600 dark:text-amber-500 mt-0.5">
            Changes to environment variables require an application restart to take effect. 
            Make sure to backup your configuration before making changes.
          </p>
        </div>
      </div>

      {/* Configuration Categories */}
      {Object.entries(schema).map(([categoryKey, category]) => (
        <Card key={categoryKey}>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              {categoryIcons[categoryKey]}
              {category.title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure {category.title.toLowerCase()} settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {category.variables.map((variable) => (
              <div key={variable.key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 md:gap-4 items-start sm:items-center">
                <div className="space-y-0.5">
                  <Label htmlFor={variable.key} className="text-xs md:text-sm flex items-center gap-1">
                    {variable.label}
                    {variable.required && <span className="text-red-500">*</span>}
                  </Label>
                  <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{variable.key}</p>
                </div>
                <div className="sm:col-span-2">
                  {renderInput(variable)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10 text-sm"
              onClick={() => handleSave(false)}
              disabled={!hasChanges() || saving}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
            
            <Button
              variant="outline"
              className="h-9 md:h-10 text-sm"
              onClick={() => handleSave(true)}
              disabled={!hasChanges() || saving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Save & Reload
            </Button>
            
            <Button
              variant="outline"
              className="h-9 md:h-10 text-sm"
              onClick={handleRestoreBackup}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
            
            {hasChanges() && (
              <Button
                variant="ghost"
                className="h-9 md:h-10 text-sm"
                onClick={() => setValues({ ...originalValues })}
                disabled={saving}
              >
                Discard Changes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reload Dialog */}
      <Dialog open={reloadDialogOpen} onOpenChange={setReloadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <RefreshCw className="h-5 w-5 text-emerald-500" />
              Configuration Saved
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Your environment configuration has been saved successfully. A restart signal has been sent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                The application needs to restart for the changes to take effect. If you're running in Docker, 
                the container will restart automatically. For other deployments, you may need to manually restart the service.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setReloadDialogOpen(false)} className="h-9 text-sm">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

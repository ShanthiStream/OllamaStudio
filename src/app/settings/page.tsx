'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sun, Moon, Zap, Cpu, Bug, Palette, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import type { AccentColor } from '@/types';

const accentColors: { value: AccentColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { settings, updateSettings, theme, setTheme } = useAppStore();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Customize your Ollama Studio experience" />

      <div className="space-y-6">
        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Themes</Label>
                <p className="text-xs text-muted-foreground">Choose your preferred appearance</p>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'light' as const, icon: Sun },
                  { value: 'dark' as const, icon: Moon },
                  { value: 'system' as const, icon: Monitor },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={theme === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(value)}
                    className="rounded-lg"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Accent Color</Label>
                <p className="text-xs text-muted-foreground">Primary color for UI elements</p>
              </div>
              <div className="flex gap-2">
                {accentColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateSettings({ accent_color: c.value })}
                    className={`w-7 h-7 rounded-full ${c.class} ${
                      settings.accent_color === c.value ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Animations</Label>
                <p className="text-xs text-muted-foreground">Enable UI animations and transitions</p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(v) => updateSettings({ animations: v })}
              />
            </div>
          </div>
        </Card>

        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Refresh Interval (ms)</Label>
                <p className="text-xs text-muted-foreground">How often UI data refreshes</p>
              </div>
              <Input
                type="number"
                value={settings.refresh_interval}
                onChange={(e) => updateSettings({ refresh_interval: Number(e.target.value) })}
                className="w-24 text-center"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Streaming Responses</Label>
                <p className="text-xs text-muted-foreground">Show AI responses as they are generated</p>
              </div>
              <Switch
                checked={settings.streaming}
                onCheckedChange={(v) => updateSettings({ streaming: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Performance Mode</Label>
                <p className="text-xs text-muted-foreground">Reduce visual effects for better performance</p>
              </div>
              <Switch
                checked={settings.performance_mode}
                onCheckedChange={(v) => updateSettings({ performance_mode: v })}
              />
            </div>
          </div>
        </Card>

        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            API Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Ollama API Endpoint</Label>
              <Input
                value={settings.api_endpoint}
                onChange={(e) => updateSettings({ api_endpoint: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Default: http://localhost:11434</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Parallel Requests</Label>
                <p className="text-xs text-muted-foreground">Number of simultaneous model requests</p>
              </div>
              {mounted && (
                <Select
                  value={String(settings.parallel_requests)}
                  onValueChange={(v) => updateSettings({ parallel_requests: Number(v) })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </Card>

        <Card className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Developer
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Developer Mode</Label>
                <p className="text-xs text-muted-foreground">Show raw API responses and debug info</p>
              </div>
              <Switch
                checked={settings.developer_mode}
                onCheckedChange={(v) => updateSettings({ developer_mode: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Debug Logs</Label>
                <p className="text-xs text-muted-foreground">Log detailed debugging information</p>
              </div>
              <Switch
                checked={settings.debug_logs}
                onCheckedChange={(v) => updateSettings({ debug_logs: v })}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

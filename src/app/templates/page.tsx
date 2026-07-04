'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Search, Plus, Copy, Trash2, Star, Edit3,
  MessageSquare, Code, PenTool, GraduationCap, Lightbulb, FolderOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { PromptTemplate } from '@/types';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'general', label: 'General', icon: MessageSquare },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'creative', label: 'Creative', icon: Lightbulb },
];

function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  template: PromptTemplate;
  onUse: (t: PromptTemplate) => void;
  onEdit: (t: PromptTemplate) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="glass-card rounded-xl p-4 hover:bg-accent/30 transition-colors group">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <FileText className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{template.name}</h3>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleFavorite(template.id)}
            className={`p-1 rounded-md transition-colors ${template.is_favorite ? 'text-amber-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
          >
            <Star className="w-3.5 h-3.5" fill={template.is_favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="mb-3">
          <code className="block text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 line-clamp-3 font-mono leading-relaxed">
            {template.content}
          </code>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] px-2 py-0">
              {template.category}
            </Badge>
            {template.variables.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0">
                {template.variables.length} vars
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              Used {template.usage_count}x
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full" onClick={() => onEdit(template)}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full" onClick={() => {
              navigator.clipboard.writeText(template.content);
              toast.success('Template copied to clipboard');
            }}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full text-destructive" onClick={() => onDelete(template.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
  onSave: (data: { name: string; description: string; content: string; category: string; tags: string[]; variables: string[] }) => void;
}) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'general');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(template?.tags || []);

  const extractedVars = [...new Set(content.match(/\{\{(\w+)\}\}/g)?.map((v) => v.replace(/\{|\}/g, '')) || [])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New Template'}</DialogTitle>
          <DialogDescription>
            {'Create a reusable prompt template with {{variable}} placeholders.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Use {{variable}} for placeholders"
              className="min-h-[120px] font-mono text-xs"
            />
          </div>

          {extractedVars.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Detected Variables</label>
              <div className="flex flex-wrap gap-1.5">
                {extractedVars.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {'{{'}{v}{'}}'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    if (!tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                    }
                    setTagInput('');
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-0.5 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!name.trim() || !content.trim()) {
              toast.error('Name and content are required');
              return;
            }
            onSave({ name: name.trim(), description: description.trim(), content: content.trim(), category, tags, variables: extractedVars });
            onOpenChange(false);
          }}>
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, incrementTemplateUsage } = useAppStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  const filtered = templates.filter((t) => {
    const matchesSearch = search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader
        title="Templates"
        description={`${templates.length} reusable prompt templates`}
      >
        <Button size="sm" className="rounded-full" onClick={() => {
          setEditingTemplate(null);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setCategory(cat.id)}
            >
              <cat.icon className="w-3.5 h-3.5 mr-1.5" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? 'Try a different search' : 'Create your first template'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={(t) => {
                incrementTemplateUsage(t.id);
                navigator.clipboard.writeText(t.content);
                toast.success(`"${t.name}" content copied to clipboard`);
              }}
              onEdit={(t) => {
                setEditingTemplate(t);
                setDialogOpen(true);
              }}
              onDelete={(id) => {
                deleteTemplate(id);
                toast.success('Template deleted');
              }}
              onToggleFavorite={(id) => {
                const t = templates.find((x) => x.id === id);
                if (t) updateTemplate(id, { is_favorite: !t.is_favorite });
              }}
            />
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={(data) => {
          if (editingTemplate) {
            updateTemplate(editingTemplate.id, data);
            toast.success('Template updated');
          } else {
            addTemplate({ ...data, is_favorite: false });
            toast.success('Template created');
          }
        }}
      />
    </div>
  );
}

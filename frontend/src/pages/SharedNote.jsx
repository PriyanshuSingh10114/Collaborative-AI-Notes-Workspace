import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const SharedNote = () => {
  const { shareId } = useParams();

  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['sharedNote', shareId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/share/${shareId}`);
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground animate-pulse">Loading shared note...</p>
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
        <h2 className="text-xl font-semibold mb-2">Note not found</h2>
        <p className="text-muted-foreground">This note doesn't exist or is no longer public.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="border-none shadow-xl bg-background">
          <CardHeader className="border-b border-border bg-muted/10 pb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                Public Note
              </span>
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="text-3xl font-bold">{note.title}</CardTitle>
            
            {note.userId && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {note.userId.name?.charAt(0).toUpperCase()}
                </div>
                <span>Shared by {note.userId.name}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <div 
              className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: note.content || '<p class="text-muted-foreground italic">Empty note...</p>' }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SharedNote;

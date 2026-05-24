
"use client";

import React, { useMemo } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function Archive() {
  const firestore = useFirestore();
  const [search, setSearch] = React.useState("");

  const docsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'documents'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);

  const { data: documents, loading } = useCollection(docsQuery);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  return (
    <div className="bg-elf-cream min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-headline text-elf-green-dark mb-6">
            Resource Archive
          </h1>
          <p className="text-elf-text-mid text-lg leading-relaxed">
            Access important documents, academic guides, and administrative resources from NiMSA-AMSA ELF.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-elf-text-light" size={20} />
          <Input 
            placeholder="Search documents..." 
            className="pl-12 h-14 rounded-full border-elf-gold/20 focus:ring-elf-gold bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elf-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <Card key={doc.id} className="bg-white border-elf-gold/10 hover:border-elf-gold transition-all group">
                  <CardContent className="p-8 flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-elf-gold/10 flex items-center justify-center text-elf-gold shrink-0">
                      <FileText size={28} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-headline text-2xl text-elf-green-dark font-bold truncate mb-1">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-elf-text-light uppercase tracking-widest mb-4">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full border-elf-gold text-elf-gold hover:bg-elf-gold hover:text-white">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Download size={14} /> Download PDF
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-elf-text-light italic">
                No documents found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

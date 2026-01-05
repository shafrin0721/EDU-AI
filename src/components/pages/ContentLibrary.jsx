import React, { useEffect, useState } from "react";
import { BookOpen, FileText, Filter, Image, Plus, Search, Upload, Video } from "lucide-react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";

const ContentLibrary = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
// Mock content data with YouTube video attribution
        const mockContent = [
          {
            id: 1,
            title: 'Introduction to Data Science',
            type: 'video',
            size: 'YouTube Video',
            duration: '45 min',
            uploads: '2024-01-15',
            status: 'published',
            views: 234,
            attribution: {
              creator: 'FreeCodeCamp',
              channel: 'FreeCodeCamp.org',
              originalUrl: 'https://www.youtube.com/watch?v=RVVgNr0Uhqk'
            }
          },
          {
            id: 2,
            title: 'Machine Learning Explained',
            type: 'video',
            size: 'YouTube Video',
            duration: '20 min',
            uploads: '2024-01-14',
            status: 'published',
            views: 189,
            attribution: {
              creator: 'Zach Galbraith',
              channel: 'ZachGalbraith',
              originalUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU'
            }
          },
          {
            id: 3,
            title: 'Neural Networks by 3Blue1Brown',
            type: 'video',
            size: 'YouTube Video',
            duration: '19 min',
            uploads: '2024-01-13',
            status: 'published',
            views: 312,
            attribution: {
              creator: 'Grant Sanderson',
              channel: '3Blue1Brown',
              originalUrl: 'https://www.youtube.com/watch?v=aircAruvnKk'
            }
          },
          {
            id: 4,
            title: 'Python Tutorial Handbook',
            type: 'document',
            size: '2.3 MB',
            pages: 45,
            uploads: '2024-01-12',
            status: 'draft',
            downloads: 89
          },
          {
            id: 5,
            title: 'ML Algorithm Flowchart',
            type: 'image',
            size: '1.8 MB',
            uploads: '2024-01-10',
            status: 'published',
            views: 156
          }
        ];
        
        setContent(mockContent);
      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600">Manage your educational content and resources</p>
        </div>
        <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />Upload Content
                    </Button>
    </div>
    {/* Filters */}
    <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                    icon={Search} />
            </div>
            <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
            </select>
        </div>
    </Card>
    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map(
            item => <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                        </div>
                        <Badge variant={getStatusColor(item.status)} size="sm">
                            {item.status}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <div className="space-y-1 text-sm text-gray-500">
                            <div>Size: {item.size}</div>
                            {item.duration && <div>Duration: {item.duration}</div>}
                            {item.pages && <div>Pages: {item.pages}</div>}
                            <div>Uploaded: {item.uploads}</div>
                            {item.attribution && <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <div className="font-medium text-gray-700">Video Credit:</div>
                                <div>Creator: {item.attribution.creator}</div>
                                <div>Channel: {item.attribution.channel}</div>
                                <a
                                    href={item.attribution.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline">View Original
                                                          </a>
                            </div>}
                        </div>
                    </div>
                    <div
                        className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            {item.views && `${item.views} views`}
                            {item.downloads && `${item.downloads} downloads`}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                    </div>
                </div>
            </Card>
        )}
    </div>
    {filteredContent.length === 0 && <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
        <p className="text-gray-600">Try adjusting your search or upload new content</p>
    </div>}
</div>
  );
};

export default ContentLibrary;
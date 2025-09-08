import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { useSports } from '@/hooks/useSports';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterSport: (sportId: string) => void;
  onFilterDate: (dateRange: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
  selectedSport: string;
  selectedDateRange: string;
}

export const SearchAndFilter = ({
  onSearch,
  onFilterSport,
  onFilterDate,
  onClearFilters,
  searchQuery,
  selectedSport,
  selectedDateRange
}: SearchAndFilterProps) => {
  const { data: sports = [] } = useSports();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = selectedSport !== 'all' || selectedDateRange !== 'all' || searchQuery;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Cari & Filter Ajakan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan lokasi atau jenis olahraga..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter Lanjutan
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Hapus Filter
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Olahraga</label>
              <Select value={selectedSport} onValueChange={onFilterSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua olahraga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua olahraga</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.Sport_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jangka Waktu</label>
              <Select value={selectedDateRange} onValueChange={onFilterDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua waktu</SelectItem>
                  <SelectItem value="today">Hari ini</SelectItem>
                  <SelectItem value="tomorrow">Besok</SelectItem>
                  <SelectItem value="this-week">Minggu ini</SelectItem>
                  <SelectItem value="next-week">Minggu depan</SelectItem>
                  <SelectItem value="this-month">Bulan ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Pencarian: "{searchQuery}"
                <button
                  onClick={() => onSearch('')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSport !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Olahraga: {sports.find(s => s.id === selectedSport)?.Sport_name}
                <button
                  onClick={() => onFilterSport('all')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedDateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Waktu: {selectedDateRange}
                <button
                  onClick={() => onFilterDate('all')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

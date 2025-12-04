import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search,
  Star,
  MapPin,
  IndianRupee,
  Filter,
  Building,
  UtensilsCrossed,
  Palette,
  Camera,
  Music,
  Flower2,
  Cake,
  Car,
  CheckCircle
} from "lucide-react";
import type { Vendor } from "@shared/schema";

const categoryConfig: Record<string, { icon: any; label: string; color: string }> = {
  venue: { icon: Building, label: "Venue", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  catering: { icon: UtensilsCrossed, label: "Catering", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  decoration: { icon: Palette, label: "Decoration", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  photography: { icon: Camera, label: "Photography", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  entertainment: { icon: Music, label: "Entertainment", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  florist: { icon: Flower2, label: "Florist", color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  cake: { icon: Cake, label: "Cake", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  transport: { icon: Car, label: "Transport", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  other: { icon: Building, label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  const category = categoryConfig[vendor.category] || categoryConfig.other;
  const Icon = category.icon;
  const priceRange = vendor.priceRange as { min?: number; max?: number } | null;

  return (
    <Link href={`/vendors/${vendor.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all h-full">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center relative">
          <Icon className="w-16 h-16 text-primary/30" />
          {vendor.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="gap-1 bg-white/90 dark:bg-black/50">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <Badge className={`mb-2 ${category.color}`}>
            {category.label}
          </Badge>
          <h3 className="font-semibold text-lg mb-1" data-testid={`vendor-name-${vendor.id}`}>
            {vendor.businessName}
          </h3>
          {vendor.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {vendor.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
            {vendor.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {vendor.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {Number(vendor.rating).toFixed(1)} ({vendor.reviewCount} reviews)
            </div>
          </div>
          {priceRange && (
            <div className="flex items-center gap-1 text-primary font-semibold">
              <IndianRupee className="w-4 h-4" />
              {priceRange.min?.toLocaleString('en-IN')} - ₹{priceRange.max?.toLocaleString('en-IN')}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Vendors() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || vendor.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendor Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and book trusted vendors for your perfect event
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-vendors"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-category">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full md:w-48">
            <IndianRupee className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="budget">Budget (₹0 - ₹50,000)</SelectItem>
            <SelectItem value="mid">Mid-Range (₹50,000 - ₹2,00,000)</SelectItem>
            <SelectItem value="premium">Premium (₹2,00,000+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={category === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory("all")}
        >
          All
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button
              key={key}
              variant={category === key ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(key)}
              className="gap-1"
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-video rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVendors && filteredVendors.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-4">
              {search || category !== "all"
                ? "Try adjusting your filters or search terms"
                : "No vendors are available at the moment"}
            </p>
            {(search || category !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

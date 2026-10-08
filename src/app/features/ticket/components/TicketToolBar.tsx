import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { TICKET_CATEGORIES, TICKET_TYPES, TicketTypes } from "@constants/ticket";
import { TicketCategory } from "@interfaces/tickets";
import { TicketCounts } from "@stores/reducers/tickets";
import { Filter, Plus, Search } from "lucide-react";
import { useState, useRef } from "react";

const statuses = {
  [TICKET_TYPES.ALL]: undefined,
  [TICKET_TYPES.NEW]: "NEW",
  [TICKET_TYPES.OPEN]: "OPEN",
  [TICKET_TYPES.IN_PROGRESS]: "PENDING",
  [TICKET_TYPES.AWAITING_REPLY]: "RESOLVED",
  [TICKET_TYPES.CLOSED]: "CLOSED",
};

export type FetchDataParams = {
  page?: number;
  limit?: number;
  status?: string | undefined;
  category?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  search?: string | undefined;
  hashtag?: string | undefined;
};

export const TicketToolBar = ({
  onCreateTicket,
  fetchData,
  counts,
  categories,
}: {
  onCreateTicket: () => void;
  // eslint-disable-next-line no-unused-vars
  fetchData: (args: FetchDataParams) => void;
  counts: TicketCounts | null;
  categories?: TicketCategory[];
}) => {
  const [activeTab, setActiveTab] = useState<TicketTypes>(TICKET_TYPES.ALL);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const showCategoryFilter = categories !== undefined;

  const parseSearchInput = (input: string) => {
    const raw = input.trim();

    // lấy hashtag dạng #abc_xyz-123
    const tags = [...raw.matchAll(/#([A-Za-z0-9_-]+)/g)].map((m) => m[1]);

    // bỏ hashtag ra khỏi search text
    const text = raw
      .replace(/#[A-Za-z0-9_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      search: text ? text : undefined,
      hashtag: tags[0] ? tags[0] : undefined,
    };
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildCategoryParam = (value: string) => (value === "all" ? undefined : value);
  const buildDateParam = (value: string) => (value ? value : undefined);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const { search: parsedSearch, hashtag } = parseSearchInput(value);
      const status = statuses[activeTab];
      fetchData({
        page: 1,
        status,
        category: buildCategoryParam(category),
        startDate: buildDateParam(startDate),
        endDate: buildDateParam(endDate),
        search: parsedSearch,
        hashtag: hashtag,
      });
    }, 300);
  };

  const handleStartDateChange = (value: string) => {
    const status = statuses[activeTab];
    const { search: parsedSearch, hashtag } = parseSearchInput(search);

    const nextStartDate = value;
    const nextEndDate = endDate && value && value > endDate ? value : endDate;

    setStartDate(nextStartDate);
    if (nextEndDate !== endDate) setEndDate(nextEndDate);

    fetchData({
      page: 1,
      status,
      category: buildCategoryParam(category),
      startDate: buildDateParam(nextStartDate),
      endDate: buildDateParam(nextEndDate),
      search: parsedSearch,
      hashtag: hashtag,
    });
  };

  const handleEndDateChange = (value: string) => {
    const status = statuses[activeTab];
    const { search: parsedSearch, hashtag } = parseSearchInput(search);

    const nextEndDate = value;
    const nextStartDate = startDate && value && startDate > value ? value : startDate;

    setEndDate(nextEndDate);
    if (nextStartDate !== startDate) setStartDate(nextStartDate);

    fetchData({
      page: 1,
      status,
      category: buildCategoryParam(category),
      startDate: buildDateParam(nextStartDate),
      endDate: buildDateParam(nextEndDate),
      search: parsedSearch,
      hashtag: hashtag,
    });
  };

  const handleTabChange = (value: string) => {
    const tab = value as TicketTypes;
    setActiveTab(tab);
    const status = statuses[tab];
    const { search: parsedSearch, hashtag } = parseSearchInput(search);
    fetchData({
      page: 1,
      status,
      category: buildCategoryParam(category),
      startDate: buildDateParam(startDate),
      endDate: buildDateParam(endDate),
      search: parsedSearch,
      hashtag: hashtag,
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const status = statuses[activeTab];
    const { search: parsedSearch, hashtag } = parseSearchInput(search);
    fetchData({
      page: 1,
      status,
      category: buildCategoryParam(value),
      startDate: buildDateParam(startDate),
      endDate: buildDateParam(endDate),
      search: parsedSearch,
      hashtag: hashtag,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 sm:flex">
            <TabsTrigger value={TICKET_TYPES.ALL} className="cursor-pointer">
              All Tickets{" "}
              <Badge variant="secondary" className="text-xs">
                {counts?.total ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={TICKET_TYPES.NEW} className="cursor-pointer">
              New{" "}
              <Badge variant="secondary" className=" text-xs">
                {counts?.new ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={TICKET_TYPES.OPEN} className="cursor-pointer">
              Open{" "}
              <Badge variant="secondary" className=" text-xs">
                {counts?.open ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={TICKET_TYPES.IN_PROGRESS} className="cursor-pointer">
              In Progress{" "}
              <Badge variant="secondary" className="text-xs">
                {counts?.pending ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={TICKET_TYPES.AWAITING_REPLY} className="cursor-pointer">
              Resolved{" "}
              <Badge variant="secondary" className="text-xs">
                {counts?.resolved ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={TICKET_TYPES.CLOSED} className="cursor-pointer">
              Closed{" "}
              <Badge variant="secondary" className="text-xs">
                {counts?.closed ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {showCategoryFilter && (
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px]" size="default">
              <Filter className="h-4 w-4 opacity-50" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.length > 0
                ? categories.map((c) => (
                    <SelectItem key={c.id} value={c.title}>
                      {c.title}
                    </SelectItem>
                  ))
                : TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              Search by date
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <Input
                type="date"
                value={startDate}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">To</span>
              <Input
                type="date"
                value={endDate}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="cursor-pointer" onClick={onCreateTicket}>
          <Plus />
          <span className="hidden lg:inline">Create New Ticket</span>
        </Button>
      </div>
    </div>
  );
};

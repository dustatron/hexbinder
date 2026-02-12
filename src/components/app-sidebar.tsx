import { useCallback, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Map,
  Calendar,
  Footprints,
  Users,
  Castle,
  Skull,
  Home,
  Hexagon,
  MapPin,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "~/components/ui/sidebar";
import { loadWorld, saveWorld } from "~/lib/storage";

/** Extract worldId from the current URL path */
function useWorldId(): string | null {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const worldMatch = pathname.match(/\/(?:world|atlas)\/([^/]+)/);
  return worldMatch?.[1] ?? null;
}

/** Extract hex ID (q,r) from hex detail or location detail pages */
function useCurrentHexFromRoute(
  worldId: string | null
): string | null {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // /world/:worldId/hex/:q/:r
  const hexMatch = pathname.match(/\/world\/[^/]+\/hex\/(-?\d+)\/(-?\d+)/);
  if (hexMatch) return `${hexMatch[1]},${hexMatch[2]}`;

  // /world/:worldId/location/:locationId — look up hex from world data
  if (worldId) {
    const locMatch = pathname.match(/\/world\/[^/]+\/location\/([^/]+)/);
    if (locMatch) {
      const world = loadWorld(worldId);
      const loc = world?.locations.find((l) => l.id === locMatch[1]);
      if (loc) return `${loc.hexCoord.q},${loc.hexCoord.r}`;
    }
  }

  return null;
}

type AtlasTab = "events" | "travel" | "factions" | "settlements" | "dungeons";

const ATLAS_TABS: {
  id: AtlasTab;
  label: string;
  icon: typeof Calendar;
}[] = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "travel", label: "Travel", icon: Footprints },
  { id: "factions", label: "Factions", icon: Users },
  { id: "settlements", label: "Settlements", icon: Castle },
  { id: "dungeons", label: "Dungeons", icon: Skull },
];

function WorldSidebar({ worldId }: { worldId: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchTab = useRouterState({
    select: (s) => (s.location.search as Record<string, string>).tab,
  });

  const [, forceUpdate] = useState(0);
  const world = useMemo(() => loadWorld(worldId), [worldId]);
  const worldName = world?.name ?? "World";

  // Detect if on a detail page with a hex we can set as current
  const routeHexId = useCurrentHexFromRoute(worldId);
  const isCurrent = world?.state.currentHexId === routeHexId;

  const handleSetCurrent = useCallback(() => {
    if (!routeHexId || !worldId) return;
    const w = loadWorld(worldId);
    if (!w) return;
    w.state.currentHexId = routeHexId;
    if (!w.state.visitedHexIds.includes(routeHexId)) {
      w.state.visitedHexIds.push(routeHexId);
    }
    saveWorld(w);
    forceUpdate((n) => n + 1);
  }, [worldId, routeHexId]);

  const counts = useMemo(() => {
    if (!world) return {} as Record<AtlasTab, number>;
    const todayRecord = world.state.calendar.find(
      (r) => r.day === world.state.day
    );
    return {
      events: todayRecord?.events.length ?? 0,
      travel: world.state.visitedHexIds.length,
      factions: world.factions.length,
      settlements: world.locations.filter((l) => l.type === "settlement")
        .length,
      dungeons: world.locations.filter((l) => l.type === "dungeon").length,
    };
  }, [world]);

  const isOnMap = pathname === `/world/${worldId}`;
  const isOnAtlas = pathname === `/atlas/${worldId}`;

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/world/$worldId" params={{ worldId }} />}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Hexagon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{worldName}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isOnMap}
                  render={<Link to="/world/$worldId" params={{ worldId }} />}
                >
                  <Map />
                  <span>Map</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {routeHexId && !isCurrent && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSetCurrent}>
                    <MapPin />
                    <span>Set as Current</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {routeHexId && isCurrent && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-green-500" disabled>
                    <MapPin />
                    <span>Current Location</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Atlas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ATLAS_TABS.map(({ id, label, icon: Icon }) => {
                const isActive = isOnAtlas && searchTab === id;
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link
                          to="/atlas/$worldId"
                          params={{ worldId }}
                          search={{ tab: id }}
                        />
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                    {counts[id] != null && (
                      <SidebarMenuBadge>{counts[id]}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" />}>
              <Home />
              <span>All Worlds</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

function HomeSidebar() {
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Hexagon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Hexbinder</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive render={<Link to="/" />}>
                  <Home />
                  <span>Worlds</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const worldId = useWorldId();

  return (
    <Sidebar collapsible="icon" {...props}>
      {worldId ? <WorldSidebar worldId={worldId} /> : <HomeSidebar />}
      <SidebarRail />
    </Sidebar>
  );
}

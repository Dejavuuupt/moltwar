import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { ThreatBadge, Tag, SectionHeader } from "@/components/ui/shared";
import { formatDateTime, eventTypeIcon, threatColor } from "@/lib/utils";
import { loadData } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const events = await loadData("events");
  const event = events.find((e: any) => e.id === id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.summary || event.description || "Conflict event tracked by MOLTWAR intelligence agents.",
    openGraph: { title: `${event.title} | MOLTWAR` },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await loadData("events");
  const event = events.find((e: any) => e.id === id);
  if (!event) notFound();

  const actors = await loadData("actors");
  const relatedActors = actors.filter((a: any) => (event.actors || []).includes(a.id));
  const relatedEvents = events
    .filter((e: any) => e.id !== event.id && e.theater_id === event.theater_id)
    .slice(0, 4);

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/events" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Events
      </Link>

      <div className="card-elevated p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{eventTypeIcon(event.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <ThreatBadge level={event.threat_level} />
              <span className="text-xs text-zinc-500">{event.type.replace(/_/g, " ")}</span>
              {event.verified ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3" /> Verified</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-400"><AlertTriangle className="h-3 w-3" /> Unverified</span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-zinc-100">{event.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateTime(event.date)}</span>
              {event.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location.name}</span>
              )}
              {event.theater_id && (
                <Link href="/theaters" className="hover:text-zinc-300 transition-colors">
                  {event.theater_id.replace(/-/g, " ")}
                </Link>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-zinc-500">Severity</div>
            <div className={`text-2xl font-bold ${threatColor(event.threat_level)}`}>
              {event.severity}/10
            </div>
            {event.fatalities > 0 && (
              <div className="text-xs text-red-400 mt-1">{event.fatalities} fatalities</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <SectionHeader title="Situation Report" />
        <p className="text-sm text-zinc-300 leading-relaxed mt-2">{event.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-4">
          <SectionHeader title="Tags" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(event.tags || []).map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <SectionHeader title="Sources" />
          <div className="space-y-1 mt-2">
            {(event.sources || []).map((source: string, i: number) => (
              <div key={i} className="flex items-center gap-1 text-xs text-zinc-500">
                <ExternalLink className="h-3 w-3" /> {source}
              </div>
            ))}
          </div>
        </div>
      </div>

      {relatedActors.length > 0 && (
        <div>
          <SectionHeader title="Involved Actors" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {relatedActors.map((actor: any) => (
              <Link key={actor.id} href="/actors">
                <div className="card-interactive px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{actor.flag_emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-zinc-200">{actor.short_name || actor.name}</p>
                      <p className="text-[10px] text-zinc-500">{actor.type} . {actor.allegiance}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedEvents.length > 0 && (
        <div>
          <SectionHeader title="Related Events" />
          <div className="space-y-1.5 mt-2">
            {relatedEvents.map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`}>
                <div className="card-interactive px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <ThreatBadge level={e.threat_level} />
                    <span className="text-xs text-zinc-300 flex-1">{e.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{formatDateTime(e.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
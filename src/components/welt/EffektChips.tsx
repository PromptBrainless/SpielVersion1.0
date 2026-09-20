import { Button } from "@/components/ui/button";
import { EFFEKT_IDS, EFFEKTE, type EffektId } from "@/game/effekte";

export function EffektChips({
  ids = EFFEKT_IDS,
  an,
  onToggle,
}: {
  ids?: EffektId[];
  an: (id: EffektId) => boolean;
  onToggle: (id: EffektId, wert: boolean) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <Button
          key={id}
          type="button"
          variant={an(id) ? "default" : "secondary"}
          className="h-9 px-2.5 text-xs"
          title={EFFEKTE[id].hint}
          onClick={() => onToggle(id, !an(id))}
        >
          {EFFEKTE[id].name}
        </Button>
      ))}
    </div>
  );
}

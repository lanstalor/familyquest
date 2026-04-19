import { useRef, useState } from 'react';
import { generatePhotoArtifact } from '../ai/provider';
import type { Item, Player, Settings } from '../types';

interface Props {
  settings: Settings;
  players: Player[];
  onAddItem: (playerId: string, item: Item) => void;
  onClose: () => void;
}

export function PhotoArtifact({ settings, players, onAddItem, onClose }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [targetPlayer, setTargetPlayer] = useState(players[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Item | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function generate() {
    setLoading(true);
    setNote(null);
    const result = await generatePhotoArtifact(photo ?? '', label, settings);
    setPreview(result.item);
    if (result.note) setNote(result.note);
    setLoading(false);
  }

  function award() {
    if (!preview || !targetPlayer) return;
    onAddItem(targetPlayer, preview);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-bg-900/85 z-50 flex items-center justify-center p-4 no-print">
      <div className="pixel-panel max-w-4xl w-full p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base">📸 PHOTO ARTIFACT</h3>
          <button onClick={onClose} className="pixel-btn ghost" aria-label="Close">
            ✕
          </button>
        </div>

        <p className="font-pixel text-xl text-ink-muted mb-5">
          Upload a photo of a drawing, Lego build, origami, or found treasure.
          The narrator forges it into a small magical item.
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="pixel-btn w-full"
            >
              {photo ? 'Choose different photo' : '📷 Take / choose photo'}
            </button>

            {photo && (
              <img
                src={photo}
                alt="Uploaded artifact"
                className="mt-4 border-4 border-ink w-full object-contain max-h-64 bg-bg-900"
              />
            )}

            <label className="block font-display text-[10px] text-coin tracking-widest mt-5 mb-2">
              LABEL (OPTIONAL)
            </label>
            <input
              className="w-full bg-bg-900 border-4 border-ink px-3 py-3 text-ink font-pixel text-xl"
              placeholder="describe in 1-2 words"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <label className="block font-display text-[10px] text-coin tracking-widest mt-4 mb-2">
              GIVE TO
            </label>
            <select
              value={targetPlayer}
              onChange={(e) => setTargetPlayer(e.target.value)}
              className="w-full bg-bg-900 border-4 border-ink px-3 py-3 text-ink font-pixel text-xl"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={generate}
              disabled={loading || (!photo && settings.provider !== 'demo')}
              className="pixel-btn primary w-full mt-5"
            >
              {loading ? 'Forging...' : '✨ FORGE ARTIFACT'}
            </button>
          </div>

          <div>
            {preview ? (
              <div className="pixel-panel parchment p-5">
                <div className="font-display text-[10px] tracking-widest">
                  {preview.type.toUpperCase()}
                </div>
                <div className="font-display text-base mt-2">{preview.name.toUpperCase()}</div>
                <p className="font-pixel text-xl mt-3">{preview.description}</p>
                {preview.effect && (
                  <div className="mt-3 font-pixel text-xl bg-panel-dark text-ink p-2 border-2 border-bg-900">
                    ✦ {preview.effect}
                  </div>
                )}
                <button onClick={award} className="pixel-btn success w-full mt-5">
                  Award to party member
                </button>
              </div>
            ) : (
              <div className="font-pixel text-xl text-ink-muted italic">
                Your forged item will appear here.
              </div>
            )}
            {note && (
              <div className="mt-3 font-pixel text-lg text-hp italic">⚠ {note}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

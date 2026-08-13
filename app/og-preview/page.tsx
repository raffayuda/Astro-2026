import Image from "next/image";

export default function OgPreview() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/90 p-10 font-sans">
      {/* 
        This is the actual OG container (1200x630). 
        You can screenshot this specific element. 
      */}
      <div 
        id="og-container"
        className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 shadow-2xl ring-1 ring-white/10"
        style={{ width: "1200px", height: "630px" }}
      >
        {/* ─── CLOUD IMAGES ─── */}
        <Image src="/assets/cloud.png" alt="" width={400} height={300} className="absolute top-[-5%] left-[-10%] w-[350px] opacity-70 pointer-events-none select-none z-0 mix-blend-overlay" />
        <Image src="/assets/cloud.png" alt="" width={400} height={300} className="absolute top-[10%] right-[-15%] w-[450px] opacity-60 pointer-events-none select-none z-0 mix-blend-overlay" />
        <Image src="/assets/awan2.png" alt="" width={400} height={300} className="absolute bottom-[-10%] right-[-5%] w-[400px] opacity-80 pointer-events-none select-none z-0" />

        {/* ─── CHROME BLOB SHAPE (static, large, edge-placed) ─── */}
        <Image src="/assets/chrome-blob-shape.png" alt="" width={448} height={560} className="absolute -top-12 -right-12 w-[400px] h-[400px] object-contain pointer-events-none select-none z-0" />
        <Image src="/assets/chrome-blob-shape.png" alt="" width={512} height={640} className="absolute -bottom-16 -left-16 w-[450px] h-[450px] object-contain pointer-events-none select-none z-0" />

        {/* Main Content Layout - Centered for Maximum Impact */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-20 -mt-10">
          
          {/* Main Title + Logo Combination */}
          <div className="flex flex-col items-center justify-center mb-6 mt-4">
            {/* Astro Logo */}
            <div className="relative w-[100px] h-[100px] mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              <Image src="/assets/logo-astro.svg" alt="Astro Logo" fill className="object-contain" />
            </div>
            
            <h1 className="text-[160px] font-black leading-[0.85] tracking-tight drop-shadow-2xl font-masterpiece flex items-center gap-8">
              <span
                className="bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 2px 0 #cbd5e1, 0 4px 0 #94a3b8, 0 6px 0 #64748b, 0 8px 20px rgba(0,0,0,0.3)',
                }}
              >
                ASTRO
              </span>
              
              <span
                className="bg-gradient-to-b from-slate-200 via-slate-500 to-slate-800 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 2px 0 #e2e8f0, 0 4px 0 #94a3b8, 0 6px 0 #475569, 0 8px 0 #1e293b, 0 12px 30px rgba(0,0,0,0.35)',
                }}
              >
                2026
              </span>
            </h1>
          </div>

          {/* Subtitle / Tagline */}
          <div className="mt-4 font-masterpiece leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.15)] text-center">
            <span className="text-[40px] text-white/95 block tracking-wide">
              Where Innovation
            </span>
            <span className="text-[64px] bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 bg-clip-text text-transparent block -mt-2">
              Meets the Stars
            </span>
          </div>

          {/* Categories */}
          <div className="mt-12 flex items-center gap-4 bg-white/20 backdrop-blur-md px-8 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40">
             <span className="text-sky-900 font-bold text-xl uppercase tracking-widest">Akademik</span>
             <span className="text-white mx-2 text-2xl">•</span>
             <span className="text-sky-900 font-bold text-xl uppercase tracking-widest">Olahraga</span>
             <span className="text-white mx-2 text-2xl">•</span>
             <span className="text-sky-900 font-bold text-xl uppercase tracking-widest">Esports</span>
          </div>
          
        </div>
        
        {/* Bottom Bar / URL */}
        <div className="absolute bottom-0 left-0 w-full h-12 flex items-center justify-center px-12 z-20">
          <div className="font-black text-sky-950 text-lg tracking-widest font-display drop-shadow-sm">
            astro.nurulfikri.ac.id
          </div>
        </div>

      </div>
    </div>
  );
}

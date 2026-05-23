
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-elf-green-dark text-white py-16 border-t border-elf-gold/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-2xl text-elf-gold italic">NiMSA-AMSA ELF</h3>
          <p className="text-white/60 text-sm tracking-widest uppercase">Emerging Leaders' Forum · AMSA Chapter</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/about" className="text-white/60 hover:text-elf-gold text-sm transition-colors">About</Link>
          <Link href="/programs" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Programs</Link>
          <Link href="/gallery" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Gallery</Link>
          <Link href="/join-us" className="text-white/60 hover:text-elf-gold text-sm transition-colors">Join Us</Link>
        </div>

        <div className="flex flex-col md:items-end gap-2 text-white/60 text-sm italic">
          <p>© 2025 NiMSA-AMSA ELF</p>
          <p className="text-elf-gold/80">Investing in Visionaries</p>
        </div>
      </div>
    </footer>
  );
}

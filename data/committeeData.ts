import { CommitteeDivision } from "@/types/committee";

export const COMMITTEE_DIVISIONS: CommitteeDivision[] = [
  {
    id: "bph",
    name: "Badan Pengurus Harian (BPI)",
    slug: "bph",
    shortDesc: "Penanggung jawab utama & pengarah seluruh jalannya ASTRO 2026",
    fullDesc:
      "Divisi Inti yang mengkoordinasikan seluruh divisi panitia, mengelola pendanaan umum, serta memastikan visi dan misi ASTRO 2026 tercapai secara maksimal.",
    color: "from-cyan-500/20 to-sky-600/20",
    leader: {
      id: "bph-1",
      name: "Ahmad Fauzi",
      role: "Ketua Pelaksana",
      divisionId: "bph",
      divisionName: "Badan Pengurus Harian",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Memimpin dengan integritas untuk menghadirkan kompetisi terbaik bagi generasi muda.",
      instagram: "ahmadfauzi_astro",
      linkedin: "ahmad-fauzi-astro",
    },
    coLeader: {
      id: "bph-2",
      name: "Siti Nurhaliza",
      role: "Wakil Ketua Pelaksana",
      divisionId: "bph",
      divisionName: "Badan Pengurus Harian",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      isLeader: false,
      quote: "Sinergi antar divisi adalah kunci utama keberhasilan acara kita.",
      instagram: "sitinurhaliza_bph",
      linkedin: "siti-nurhaliza",
    },
    staffCount: 6,
    members: [
      {
        id: "bph-1",
        name: "Ahmad Fauzi",
        role: "Ketua Pelaksana",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
        quote: "Memimpin dengan integritas untuk menghadirkan kompetisi terbaik.",
      },
      {
        id: "bph-2",
        name: "Siti Nurhaliza",
        role: "Wakil Ketua Pelaksana",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
        quote: "Sinergi antar divisi adalah kunci utama keberhasilan.",
      },
      {
        id: "bph-3",
        name: "Nabila Putri",
        role: "Sekretaris Utama",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "bph-4",
        name: "Dimas Anggara",
        role: "Bendahara Utama",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "bph-5",
        name: "Anisa Rahma",
        role: "Sekretaris II",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "bph-6",
        name: "Fikri Haikal",
        role: "Bendahara II",
        divisionId: "bph",
        divisionName: "Badan Pengurus Harian",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "acara",
    name: "Acara & Kompetisi",
    slug: "acara",
    shortDesc: "Perancang konsep acara, sistem lomba & pengawas teknis pertandingan",
    fullDesc:
      "Menyusun alur kegiatan, rulebook pertandingan akademik, olahraga, dan esports, serta berkoordinasi dengan juri profesional.",
    color: "from-blue-500/20 to-indigo-600/20",
    leader: {
      id: "acara-1",
      name: "Rizky Pratama",
      role: "Koordinator Acara",
      divisionId: "acara",
      divisionName: "Acara & Kompetisi",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Pengalaman bertanding yang kompetitif dan sportif adalah prioritas nomor satu kami.",
      instagram: "rizky_pratama_events",
      linkedin: "rizky-pratama-events",
    },
    staffCount: 8,
    members: [
      {
        id: "acara-1",
        name: "Rizky Pratama",
        role: "Koordinator Acara",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "acara-2",
        name: "Clarissa Maharani",
        role: "PJ Lomba Akademik",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-3",
        name: "Kevin Prasetya",
        role: "PJ Lomba Esports",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-4",
        name: "Bintang Perkasa",
        role: "PJ Lomba Olahraga",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-5",
        name: "Nadia Salsabila",
        role: "Staf Stage Manager",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-6",
        name: "Reza Rahardian",
        role: "Staf Protocoler & Liaison Officer",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-7",
        name: "Maya Indah",
        role: "Staf Timekeeper & Scorer",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "acara-8",
        name: "Aldo Febrian",
        role: "Staf Talent & MC Management",
        divisionId: "acara",
        divisionName: "Acara & Kompetisi",
        image:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "sponsorship",
    name: "Sponsorship & Kemitraan",
    slug: "sponsorship",
    shortDesc: "Penggalang pendanaan, negosiator sponsor & hubungan dengan mitra industri",
    fullDesc:
      "Menjalin kolaborasi strategis dengan berbagai brand, perusahaan, dan institusi untuk mensukseskan pendanaan dan hadiah peserta ASTRO 2026.",
    color: "from-amber-500/20 to-orange-600/20",
    leader: {
      id: "sponsor-1",
      name: "Farhan Naufal",
      role: "Koor. Sponsorship",
      divisionId: "sponsorship",
      divisionName: "Sponsorship & Kemitraan",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Membangun kemitraan yang saling menguntungkan dan berdampak jangka panjang.",
      instagram: "farhannaufal_sp",
      linkedin: "farhan-naufal-sponsorship",
    },
    staffCount: 5,
    members: [
      {
        id: "sponsor-1",
        name: "Farhan Naufal",
        role: "Koor. Sponsorship",
        divisionId: "sponsorship",
        divisionName: "Sponsorship & Kemitraan",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "sponsor-2",
        name: "Gita Gutawa",
        role: "Sub-Koor Corporate Partnership",
        divisionId: "sponsorship",
        divisionName: "Sponsorship & Kemitraan",
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "sponsor-3",
        name: "Raihan Saputra",
        role: "Staf Negosiator Sponsor",
        divisionId: "sponsorship",
        divisionName: "Sponsorship & Kemitraan",
        image:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "sponsor-4",
        name: "Tania Kirana",
        role: "Staf Proposal & Pitching",
        divisionId: "sponsorship",
        divisionName: "Sponsorship & Kemitraan",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "sponsor-5",
        name: "Aditya Surya",
        role: "Staf Laporan Benefitisasi Sponsor",
        divisionId: "sponsorship",
        divisionName: "Sponsorship & Kemitraan",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "humas",
    name: "Humas & Outreach",
    slug: "humas",
    shortDesc: "Jembatan komunikasi peserta, media partner & institusi luar",
    fullDesc:
      "Mengelola customer service peserta, mengomunikasikan pengumuman penting, serta memajukan jangkauan publikasi ASTRO ke seluruh sekolah dan universitas.",
    color: "from-emerald-500/20 to-teal-600/20",
    leader: {
      id: "humas-1",
      name: "Dinda Permata",
      role: "Koor. Humas & Outreach",
      divisionId: "humas",
      divisionName: "Humas & Outreach",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Komunikasi yang hangat dan responsif adalah kunci kepuasan peserta.",
      instagram: "dindapermata_pr",
      linkedin: "dinda-permata-pr",
    },
    staffCount: 6,
    members: [
      {
        id: "humas-1",
        name: "Dinda Permata",
        role: "Koor. Humas & Outreach",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "humas-2",
        name: "Rian Febrian",
        role: "Sub-Koor Media Relation",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "humas-3",
        name: "Putri Ayu",
        role: "Staf Service Officer & Admin WA",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "humas-4",
        name: "Faisal Akbar",
        role: "Staf Outreach Sekolah & Kampus",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "humas-5",
        name: "Melati Anggraini",
        role: "Staf Undangan VIP & Juri",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "humas-6",
        name: "Bagus Priyambodo",
        role: "Staf Press Release & Publikasi",
        divisionId: "humas",
        divisionName: "Humas & Outreach",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "media",
    name: "Media, Design & Dekdok",
    slug: "media",
    shortDesc: "Pencipta brand visual, konten sosial media, live stream & videografi",
    fullDesc:
      "Bertanggung jawab penuh terhadap estetika visual ASTRO 2026 mulai dari desain website, feed Instagram, liputan foto/video, hingga siaran langsung final.",
    color: "from-purple-500/20 to-pink-600/20",
    leader: {
      id: "media-1",
      name: "Bagas Wicaksono",
      role: "Koor. Media & Visual",
      divisionId: "media",
      divisionName: "Media, Design & Dekdok",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Setiap sudut visual dan dokumentasi harus menceritakan semangat para juara.",
      instagram: "bagaswicaksono_art",
      linkedin: "bagas-wicaksono-creative",
    },
    staffCount: 7,
    members: [
      {
        id: "media-1",
        name: "Bagas Wicaksono",
        role: "Koor. Media & Visual",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "media-2",
        name: "Sherly Amanda",
        role: "Sub-Koor Graphic Designer",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "media-3",
        name: "Hafiz Maulana",
        role: "Staf Videographer & Editor",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "media-4",
        name: "Natasha Wilona",
        role: "Staf Content Creator TikTok/Reels",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "media-5",
        name: "Rendy Kurniadi",
        role: "Staf Photographer Off-stage",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "media-6",
        name: "Eka Lestari",
        role: "Staf UI/UX & Web Maintainer",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "media-7",
        name: "Bima Sakti",
        role: "Staf Broadcast & Live Streaming",
        divisionId: "media",
        divisionName: "Media, Design & Dekdok",
        image:
          "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "logistik",
    name: "Logistik & Perlengkapan",
    slug: "logistik",
    shortDesc: "Penyedia infrastruktur venue, jaringan internet, sound & alat pertandingan",
    fullDesc:
      "Memastikan seluruh perangkat venue, studio esports, panggung awarding, serta jaringan listrik dan internet beroperasi tanpa kendala.",
    color: "from-cyan-500/20 to-blue-600/20",
    leader: {
      id: "log-1",
      name: "Maya Putri",
      role: "Koor. Logistik & Perlengkapan",
      divisionId: "logistik",
      divisionName: "Logistik & Perlengkapan",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote: "Kesiapan infrastruktur dan kenyamanan venue adalah pondasi utama acara yang sukses.",
      instagram: "mayaputri_logistics",
      linkedin: "maya-putri-logistics",
    },
    staffCount: 6,
    members: [
      {
        id: "log-1",
        name: "Maya Putri",
        role: "Koor. Logistik & Perlengkapan",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "log-2",
        name: "Riko Simanjuntak",
        role: "Sub-Koor Venue & Setting Up",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "log-3",
        name: "Taufik Hidayat",
        role: "Staf IT Infrastructure & LAN Network",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "log-4",
        name: "Sari Puspita",
        role: "Staf Inventory & Equipment Check",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "log-5",
        name: "Denny Sumargo",
        role: "Staf Sound System & Lighting",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "log-6",
        name: "Aris Munandar",
        role: "Staf Keamanan & Ketertiban",
        divisionId: "logistik",
        divisionName: "Logistik & Perlengkapan",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "konsumsi",
    name: "Konsumsi & Medis",
    slug: "konsumsi",
    shortDesc: "Penyedia catering makanan peserta/panitia & pertolongan pertama kesehatan",
    fullDesc:
      "Menjamin ketersediaan konsumsi bernutrisi tepat waktu dan kesiapan fasilitas pertolongan pertama (P3K) di seluruh titik arena pertandingan.",
    color: "from-rose-500/20 to-red-600/20",
    leader: {
      id: "kon-1",
      name: "Rian Hidayat",
      role: "Koor. Konsumsi & Medis",
      divisionId: "konsumsi",
      divisionName: "Konsumsi & Medis",
      image:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
      isLeader: true,
      quote:
        "Kesehatan dan stamina panitia serta peserta adalah modal utama daya juang di lapangan.",
      instagram: "rian_hidayat_medis",
      linkedin: "rian-hidayat-catering",
    },
    staffCount: 4,
    members: [
      {
        id: "kon-1",
        name: "Rian Hidayat",
        role: "Koor. Konsumsi & Medis",
        divisionId: "konsumsi",
        divisionName: "Konsumsi & Medis",
        image:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
        isLeader: true,
      },
      {
        id: "kon-2",
        name: "dr. Alissa Wahid",
        role: "PJ Medis & First Aid",
        divisionId: "konsumsi",
        divisionName: "Konsumsi & Medis",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "kon-3",
        name: "Vina Panduwinata",
        role: "Staf Catering VIP & Juri",
        divisionId: "konsumsi",
        divisionName: "Konsumsi & Medis",
        image:
          "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "kon-4",
        name: "Galih Ginanjar",
        role: "Staf Distribusi Konsumsi Peserta",
        divisionId: "konsumsi",
        divisionName: "Konsumsi & Medis",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
];

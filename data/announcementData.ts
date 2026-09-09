import { Competition } from "@/types/astro";

export interface Winner {
  name: string;
  title?: string; // e.g. "Ketua Tim" for team competitions
  image?: string;
}

export interface WinnersData {
  id: string;
  competitionId: string;
  competitionTitle: string;
  category: Competition["category"];
  type: "individual" | "team";
  winners: {
    first: Winner[];
    second: Winner[];
    third: Winner[];
  };
}

export const ANNOUNCEMENT_WINNERS: WinnersData[] = [
  {
    id: "win-astro-hackathon",
    competitionId: "astro-hackathon",
    competitionTitle: "Astro Hackathon",
    category: "akademik",
    type: "team",
    winners: {
      first: [
        { name: "Tim ByteBusters", title: "Ketua Tim" },
        { name: "Ahmad Fauzi", title: "Anggota" },
        { name: "Siti Nurhaliza", title: "Anggota" },
      ],
      second: [
        { name: "Tim CodeVengers", title: "Ketua Tim" },
        { name: "Rizky Pratama", title: "Anggota" },
        { name: "Dinda Permata", title: "Anggota" },
      ],
      third: [
        { name: "Tim Algoritma", title: "Ketua Tim" },
        { name: "Bagas Wicaksono", title: "Anggota" },
      ],
    },
  },
  {
    id: "win-science-olympiad",
    competitionId: "science-olympiad",
    competitionTitle: "Science Olympiad",
    category: "akademik",
    type: "individual",
    winners: {
      first: [{ name: "Budi Santoso" }],
      second: [{ name: "Clarissa Maharani" }],
      third: [{ name: "Dimas Anggara" }],
    },
  },
  {
    id: "win-debate-championship",
    competitionId: "debate-championship",
    competitionTitle: "Debate Championship",
    category: "akademik",
    type: "team",
    winners: {
      first: [
        { name: "Tim Orator Muda", title: "Tim" },
        { name: "Rian Febrian", title: "Anggota" },
        { name: "Nadia Salsabila", title: "Anggota" },
      ],
      second: [
        { name: "Tim Debatku", title: "Tim" },
        { name: "Kevin Prasetya", title: "Anggota" },
      ],
      third: [{ name: "Tim Brilian" }],
    },
  },
  {
    id: "win-astro-futsal",
    competitionId: "astro-futsal",
    competitionTitle: "Astro Futsal Cup",
    category: "olahraga",
    type: "team",
    winners: {
      first: [
        { name: "SMA Nusantara FC", title: "Tim" },
        { name: "Riko Simanjuntak", title: "Kapten" },
      ],
      second: [
        { name: "SMK Juara United", title: "Tim" },
        { name: "Denny Sumargo", title: "Kapten" },
      ],
      third: [{ name: "MAN 2 Jakarta", title: "Tim" }],
    },
  },
  {
    id: "win-badminton-championship",
    competitionId: "badminton-championship",
    competitionTitle: "Badminton Championship",
    category: "olahraga",
    type: "team",
    winners: {
      first: [{ name: "Kevin Sanjaya & Putri Ayu", title: "Ganda Campuran" }],
      second: [{ name: "Taufik Hidayat & Sari Puspita", title: "Ganda Campuran" }],
      third: [{ name: "Rendi Kurniadi & Melati", title: "Ganda Campuran" }],
    },
  },
  {
    id: "win-basketball-league",
    competitionId: "basketball-league",
    competitionTitle: "Basketball 3x3 League",
    category: "olahraga",
    type: "team",
    winners: {
      first: [
        { name: "Tim Lakers Muda", title: "Tim" },
        { name: "Faisal Akbar", title: "Kapten" },
      ],
      second: [
        { name: "Tim Warriors Indonesia", title: "Tim" },
        { name: "Bima Sakti", title: "Kapten" },
      ],
      third: [{ name: "Tim Bulls Jakarta", title: "Tim" }],
    },
  },
  {
    id: "win-mlbb-tournament",
    competitionId: "mlbb-tournament",
    competitionTitle: "Mobile Legends Tournament",
    category: "esports",
    type: "team",
    winners: {
      first: [
        { name: "RRQ Muda", title: "Tim" },
        { name: "Rafi Ahmad", title: "Kapten" },
      ],
      second: [
        { name: "EVOS NextGen", title: "Tim" },
        { name: "Aldo Febrian", title: "Kapten" },
      ],
      third: [{ name: "ONIC Junior", title: "Tim" }],
    },
  },
  {
    id: "win-valorant-tournament",
    competitionId: "valorant-tournament",
    competitionTitle: "Valorant Championship",
    category: "esports",
    type: "team",
    winners: {
      first: [
        { name: "Tim Radiant Elite", title: "Tim" },
        { name: "Reza Rahardian", title: "Kapten" },
      ],
      second: [{ name: "Tim Phoenix Rising", title: "Tim" }],
      third: [{ name: "Tim Viper Strike", title: "Tim" }],
    },
  },
  {
    id: "win-fifa-championship",
    competitionId: "fifa-championship",
    competitionTitle: "FIFA 24 Championship",
    category: "esports",
    type: "individual",
    winners: {
      first: [{ name: "Galih Ginanjar" }],
      second: [{ name: "Raihan Saputra" }],
      third: [{ name: "Aditya Surya" }],
    },
  },
];

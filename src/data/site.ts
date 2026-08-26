export const site = {
  name: "Isentropic Robotics",
  wordmark: "Isentropic Robotics",
  phi: "φ",
  description:
    "Isentropic Robotics fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  email: "contact@isentropicrobotics.org",
  sponsorPacket: "/files/isentropic-sponsor-packet.pdf",
  formNames: {
    sponsor: "sponsor-contact",
    manuscript: "manuscript-request",
    application: "application",
  },
} as const;

export type Site = typeof site;

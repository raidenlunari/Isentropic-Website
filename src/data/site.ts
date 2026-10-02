export const site = {
  name: "Isentropic Robotics",
  wordmark: "Isentropic Robotics",
  phi: "φ",
  description:
    "Isentropic Robotics is a registered 501(c)(3) non profit which fosters STEM education through support for competitive robotics and community events for aspiring engineering students.",
  email: "contact@isentropic.tech",
  formNames: {
    manuscript: "manuscript-request",
    application: "application",
    partsDonation: "parts-donation",
    partsRequest: "parts-request",
  },
} as const;

export type Site = typeof site;

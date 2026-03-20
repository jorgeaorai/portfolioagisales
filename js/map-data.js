const BRAZIL_SVG_PATHS = {
  "AC": "M118 410l-12-1 3-10 14-2 6 9h-11z",
  "AL": "M550 361l-5 4-5-4 5-4z",
  "AM": "M110 320l80-50 100 20-20 100-160 30z",
  "AP": "M320 200l20-10 10 30-30 10z",
  "BA": "M450 380l40-20 20 60-30 80-60-20z",
  "CE": "M500 300l30-10 10 30-20 20z",
  "DF": "M420 450l10-10 10 10-10 10z",
  "ES": "M490 510l10-5 5 15-15 5z",
  "GO": "M380 430l60-20 20 60-60 40z",
  "MA": "M400 280l40-10 20 50-50 30z",
  "MG": "M420 480l60-10 20 50-60 40z",
  "MS": "M320 500l50-10 10 60-60 20z",
  "MT": "M280 400l80-20 20 80-80 40z",
  "PA": "M280 250l100-30 40 80-70 120-120-20z",
  "PB": "M540 320l15-5 5 15-15 5z",
  "PE": "M520 340l30-5 5 15-30 5z",
  "PI": "M440 310l40-10 20 50-50 20z",
  "PR": "M360 580l50-5 10 30-60 10z",
  "RJ": "M480 540l20-5 5 15-20 5z",
  "RN": "M540 300l15-5 5 15-15 5z",
  "RO": "M220 380l50-10 10 50-50 20z",
  "RR": "M180 220l40-10 10 40-40 20z",
  "RS": "M340 640l60-5 15 50-70 20z",
  "SC": "M360 610l45-5 10 25-50 10z",
  "SE": "M540 380l-5 4-5-4 5-4z",
  "SP": "M380 540l60-10 15 40-70 30z",
  "TO": "M380 340l40-10 20 70-50 20z"
};

const BRAZIL_OFFICES = {
  "CE": {
    name: "Ceará",
    photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    description: "Nossa sede estratégica no Ceará, atendendo a região Nordeste com foco em inovação e consultoria empresarial personalizada."
  },
  "PB": {
    name: "Paraíba",
    photo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
    description: "Presença consolidada na Paraíba, oferecendo soluções ágeis para o ecossistema de saúde e benefícios locais."
  },
  "PE": {
    name: "Pernambuco",
    photo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800",
    description: "Atuação destacada em Pernambuco, conectando empresas tradicionais ao futuro digital e gestão de vidas eficiente."
  },
  "RN": {
    name: "Rio Grande do Norte",
    photo: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800",
    description: "Centro de excelência operacional no RN, garantindo proximidade e suporte técnico especializado para nossos parceiros."
  },
  "PI": {
    name: "Piauí",
    photo: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800",
    description: "Expandindo horizontes no Piauí, com foco em capilaridade e atendimento consultivo direto ao empreendedor."
  },
  "AL": {
    name: "Alagoas",
    photo: "https://images.unsplash.com/photo-1497215641119-8696eb7f401d?auto=format&fit=crop&q=80&w=800",
    description: "Atendimento regional em Alagoas, focado em soluções customizadas para o setor corporativo e industrial."
  },
  "GO": {
    name: "Goiás",
    photo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    description: "Ponto focal na região Centro-Oeste, o escritório de Goiás é peça chave na nossa logística nacional e atendimento regional."
  }
};

const BRAZIL_STATES = [
  { id: "AC", x: 15, y: 65 },
  { id: "AL", x: 92, y: 55, office: true },
  { id: "AM", x: 25, y: 45 },
  { id: "AP", x: 50, y: 30 },
  { id: "BA", x: 80, y: 65 },
  { id: "CE", x: 85, y: 45, office: true },
  { id: "DF", x: 65, y: 75 },
  { id: "ES", x: 82, y: 85 },
  { id: "GO", x: 65, y: 75, office: true },
  { id: "MA", x: 70, y: 45 },
  { id: "MG", x: 75, y: 80 },
  { id: "MS", x: 55, y: 85 },
  { id: "MT", x: 55, y: 65 },
  { id: "PA", x: 55, y: 45 },
  { id: "PB", x: 92, y: 48, office: true },
  { id: "PE", x: 92, y: 52, office: true },
  { id: "PI", x: 78, y: 48, office: true },
  { id: "PR", x: 65, y: 92 },
  { id: "RJ", x: 80, y: 92 },
  { id: "RN", x: 92, y: 45, office: true },
  { id: "RO", x: 35, y: 75 },
  { id: "RR", x: 35, y: 35 },
  { id: "RS", x: 60, y: 100 },
  { id: "SC", x: 65, y: 98 },
  { id: "SE", x: 92, y: 58 },
  { id: "SP", x: 70, y: 92 },
  { id: "TO", x: 65, y: 55 }
];

export const CHECKLIST_TYPES = {
  DAILY_VEHICLE: 'Günlük Araç Kontrolü (Sepetli Vinç)',
  WORK_PERMIT: 'İş İzin Formu (Work Permit)',
  RISK_ANALYSIS: 'İş Öncesi Risk Analiz Formu (JSA)',
  SITE_AUDIT: 'Saha İSG Denetim Formu (F.567)'
};

export interface Question {
  id: string;
  text: string;
}

export interface Section {
  section: string;
  items: Question[];
}

export const ALL_QUESTIONS: Record<string, Section[]> = {
  DAILY_VEHICLE: [
    { 
      section: '1. ARAÇ DIŞI VE KABİN KONTROLLERİ', 
      items: [
        { id: '1.1', text: 'Aracın altında/motorunda yağ, yakıt veya su sızıntısı var mı?' },
        { id: '1.2', text: 'Lastiklerin havaları, diş derinlikleri ve bijonları sağlam mı?' },
        { id: '1.3', text: 'Farlar, sinyal lambaları ve tepe lambası çalışıyor mu?' },
        { id: '1.4', text: 'Korna ve geri vites ikaz sesi çalışıyor mu?' },
        { id: '1.5', text: 'Araçta yangın tüpü ve ilk yardım çantası mevcut mu?' },
      ]
    },
    { 
      section: '2. BOM VE DESTEK SİSTEMİ', 
      items: [
        { id: '2.1', text: 'Hidrolik sistemde yağ kaçağı veya hasar var mı?' },
        { id: '2.2', text: 'Denge ayakları sorunsuz açılıp kapanıyor mu?' },
        { id: '2.3', text: 'Platform ahşap destek takozları araçta mevcut mu?' },
      ]
    }
  ],
  WORK_PERMIT: [
    { 
      section: 'A. ÇALIŞMA ÖNCESİ ONAYLAR', 
      items: [
        { id: 'WP.1', text: 'Yapılacak iş ve kapsamı ekip tarafından tam olarak anlaşıldı mı?' },
        { id: 'WP.2', text: 'Çalışma alanı emniyet şeridi ile çevrildi mi?' },
        { id: 'WP.3', text: 'Hattın enerjisi kesildi mi ve topraklama yapıldı mı?' },
      ]
    },
    { 
      section: 'B. EKİPMAN VE KKD', 
      items: [
        { id: 'WP.4', text: 'Emniyet kemerleri ve baretler sağlam ve giyilmiş durumda mı?' },
        { id: 'WP.5', text: 'İzole eldivenlerin yalıtım testi yapıldı mı?' },
      ]
    }
  ],
  RISK_ANALYSIS: [
    { 
      section: 'RİSK DEĞERLENDİRME', 
      items: [
        { id: 'RA.1', text: 'Hava koşulları (rüzgar, yağmur) çalışmaya uygun mu?' },
        { id: 'RA.2', text: 'Trafik akışı ve çevre güvenliği sağlandı mı?' },
        { id: 'RA.3', text: 'Yüksekte çalışma için sepet kullanımı zorunlu mu?' },
      ]
    }
  ]
};

export const REQUIRED_PERSONNEL_DOCUMENTS = [
  'Kimlik Fotokopisi',
  'Ehliyet & Sürücü Kartı',
  'MYK Belgesi (Mesleki Yeterlilik)',
  'Sağlık Raporu (Ağır İşler)',
  'SGK İşe Giriş Bildirgesi',
  'Adli Sicil Kaydı',
  'İkametgah Belgesi',
  'EKAT Belgesi (Yüksek Gerilim)',
  'Yüksekte Çalışma Belgesi',
  'Mesleki Eğitim Belgesi',
  'KVKK Onay Formu',
  'Yapım Metotları Eğitimi'
];

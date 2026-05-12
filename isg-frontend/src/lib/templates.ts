export const CHECKLIST_TYPES = {
  DAILY_VEHICLE: 'İş Makineleri (Sepetli) Kontrol Formu',
  WORK_PERMIT: 'Yüklenici Güvenli Çalışma İş İzin Formu',
  RISK_ANALYSIS: 'İş Öncesi Risk Analiz Formu',
  SITE_AUDIT: 'Saha İSG Denetim Formu (F.567)',
  CONTRACTOR_AUDIT: 'Yüklenici Denetleme Kontrol Formu'
};

export interface Question {
  id: string;
  text: string;
}

export interface Section {
  section: string;
  items: Question[];
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'datetime-local';
}

export interface ChecklistTemplate {
  sections: Section[];
  customFields: CustomField[];
}

export const ALL_QUESTIONS: Record<string, ChecklistTemplate> = {
  DAILY_VEHICLE: {
    customFields: [
      { id: 'checkDate', label: 'Denetim Tarihi', type: 'date' },
      { id: 'inspector', label: 'Kontrolü Yapan', type: 'text' },
      { id: 'location', label: 'Lokasyon', type: 'text' },
      { id: 'workTitle', label: 'Yapılan İş', type: 'text' },
      { id: 'plate', label: 'Araç Plaka', type: 'text' },
    ],
    sections: [
      { 
        section: 'İŞ MAKİNELERİ KONTROL LİSTESİ', 
        items: [
          { id: '1', text: 'Operatörün mesleki yeterlilik belgesi var mı?' },
          { id: '2', text: 'Vinç güncel periyodik kontrol formu araç içinde mevcut mu?' },
          { id: '3', text: 'Aracın hidrolik yağ hortumları sağlam mı? Hidrolik sızıntı/döküntü var mı?' },
          { id: '4', text: 'Araçta ilkyardım seti var mı?' },
          { id: '5', text: 'Araçta uygun yangın söndürme tüpü var mı? (Dolu ve periyodik kontrollü)' },
          { id: '6', text: 'Direksiyon, vites, fren, gaz pedal sistemi ve el freni sağlam mı?' },
          { id: '7', text: 'Sesli, ışıklı ikaz sistemleri (tepe lambası, farlar, sinyal vb.) çalışıyor mu?' },
          { id: '8', text: 'Lastiğin diş derinlikleri uygun mu?' },
          { id: '9', text: 'Makine içerisinde emici mat ve tehlikeli atık poşeti mevcut mu?' },
          { id: '10', text: 'Mekanik aksamları (cıvata, parçalar, bom kilitleri vb.) uygun mu?' },
          { id: '11', text: 'Ayna, camlar, basamak ve tutamaklar sağlam mı?' },
          { id: '12', text: 'Araç üzerinde tehlike ve uyarı levhaları var mı?' },
          { id: '13', text: 'Araç içi kabin emniyet kemeri çalışıyor mu?' },
          { id: '14', text: 'Kumandalar, frenler ve kollar düzgün çalışıyor mu?' },
          { id: '15', text: 'Sepet gövdesinde deformasyon var mı? (Çatlak veya kırık)' },
          { id: '16', text: 'Sepet ile bom bağlantı kısımları sağlam mı?' },
          { id: '17', text: 'Sepetli araç denge terazisi çalışır durumda mı?' },
          { id: '18', text: 'Sepetin taşıma kapasitesi levhası mevcut mu?' },
          { id: '19', text: 'Acil durdurma butonu var mı ve çalışıyor mu?' },
          { id: '20', text: 'Kameralar çalışıyor mu?' },
        ]
      }
    ]
  },
  WORK_PERMIT: {
    sections: [
      {
        section: "YAPILACAK İŞ",
        items: [
          { id: "WP_T1", text: "Kanal Kazı Çalışması" },
          { id: "WP_T2", text: "Direk Çukuru Kazı Çalışması" },
          { id: "WP_T3", text: "Yeraltı Kablo Çekim İşi" },
          { id: "WP_T4", text: "Asfalt Kesme Çalışması" },
          { id: "WP_T5", text: "Kablo Başlığı Çalışması" },
          { id: "WP_T6", text: "Beton Köşk Montajı" },
          { id: "WP_T7", text: "Beton Köşk Demontajı" },
          { id: "WP_T8", text: "Kaldırma Operasyonu" },
          { id: "WP_T9", text: "İletken Çekimi" },
          { id: "WP_T10", text: "İletken Demontajı" },
          { id: "WP_T11", text: "Pano, Hücre Montajı" },
          { id: "WP_T12", text: "Pano Hücre Demontajı" },
          { id: "WP_T13", text: "Direk Montajı" },
          { id: "WP_T14", text: "Direk Demontajı" },
          { id: "WP_T15", text: "Yüksekte Çalışma" },
          { id: "WP_T16", text: "Beton Atımı" },
          { id: "WP_T17", text: "Havai Hat Ekipman Montajı" },
          { id: "WP_T18", text: "Havai Hat Ekipman Demontajı" },
          { id: "WP_T19", text: "İnşaat" },
          { id: "WP_T20", text: "Kaynak Kesme" },
          { id: "WP_T21", text: "Enerji Açma Kesme" },
          { id: "WP_T22", text: "Diğer" }
        ]
      }
    ],
    customFields: [
      { id: "permitStartDate", label: "İzin Başlama Tarihi", type: "date" },
      { id: "permitEndDate", label: "İzin Bitiş Tarihi", type: "date" },
      { id: "contractorName", label: "Yüklenici Firma Adı", type: "text" },
      { id: "workLocation", label: "Çalışmanın Yapılacağı Lokasyon", type: "text" }
    ]
  },
  RISK_ANALYSIS: {
    sections: [
      {
        section: "ÇALIŞMA ORTAMINDAKİ TEHLİKE veya RİSKLER",
        items: [
          { id: "RA_R1", text: "Elektrik çarpması" },
          { id: "RA_R2", text: "Elektrik arkı" },
          { id: "RA_R3", text: "Yüksekten düşme" },
          { id: "RA_R4", text: "Yüksekten malzeme düşürme" },
          { id: "RA_R5", text: "Araç Trafiği" },
          { id: "RA_R6", text: "Uygunsuz Kişisel Koruyucu Donanımlar" },
          { id: "RA_R7", text: "Şarjlı hava" },
          { id: "RA_R8", text: "Yangın" },
          { id: "RA_R9", text: "Direğin Sağlam Olmaması" },
          { id: "RA_R10", text: "Yaya Trafiği" },
          { id: "RA_R11", text: "Uygunsuz ekipman/Malzeme/Donanım" },
          { id: "RA_R12", text: "Vücudun bir yerinin kesilmesi" },
          { id: "RA_R13", text: "Göçük/Çökme Devrilme" },
          { id: "RA_R14", text: "Parlama/Patlama" },
          { id: "RA_R15", text: "Malzeme düşmesi/çarpması" },
          { id: "RA_R16", text: "Çevresel Etkiler (Hayvan saldırısı, ısırması, vb.)" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - Çevre Güvenliği",
        items: [
          { id: "RA_P1", text: "Gerekli bariyerleme ve trafik işaretlemeleri yapıldı mı?" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - Yük Kaldırma ve Ekipmanlar",
        items: [
          { id: "RA_P2", text: "Kullanılan iş ekipmanları sağlam mı?" },
          { id: "RA_P3", text: "İş ekipmanlarını kullanacak çalışanın sertifika/ehliyeti var mı?" },
          { id: "RA_P4", text: "Kullanılan kaldırma aracı ve basınçlı ekipmanların periyodik kontrol raporu uygun mu?" },
          { id: "RA_P5", text: "Sapanlama yapan personel sapancı/işaretçi eğitimi aldı mı?" },
          { id: "RA_P6", text: "Kullanılacak sapan veya zincir standardı uygun ve sağlam mı?" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - Yüksekte Çalışma",
        items: [
          { id: "RA_P7", text: "Yüksekten düşmeye karşı gerekli önlemler alındı mı?" },
          { id: "RA_P8", text: "Paraşüt tipi emniyet kemeri, çift kollu lanyard vb. ekipmanlar standartlara uygun mu?" },
          { id: "RA_P9", text: "Aşağı malzeme düşme riskine karşı gerekli önlemler alındı mı?" },
          { id: "RA_P10", text: "Kullanılan merdiven EN 131 standardına sahip ve uygun mu?" },
          { id: "RA_P11", text: "Direğin sağlamlık kontrolleri yapıldı mı? (Direk dibi, köşebent vb.)" },
          { id: "RA_P12", text: "Sepetli araç EN 280 standardı var mı?" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - Elektriksel Güvenlik",
        items: [
          { id: "RA_P13", text: "İş Sahibi ile birlikte Enerji Kesme Verme (EKV) Protokolü dolduruldu mu?" },
          { id: "RA_P14", text: "Çalışma Alanında Enerji Kesildi mi ve ekip üyelerine aktarıldı mı?" },
          { id: "RA_P15", text: "LOTO uygulandı mı?" },
          { id: "RA_P16", text: "Enerji kontrolü tüm fazlar ve nötr hattında yapıldı mı?" },
          { id: "RA_P17", text: "Uygun topraklama aparatlarıyla topraklamalar yapıldı mı?" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - KKD ve Çevresel Etkiler",
        items: [
          { id: "RA_P18", text: "İşe uygun ve CE işaretli KKD'ler mevcut ve sağlam mı?" },
          { id: "RA_P19", text: "Çevresel etkiler kontrol altına alındı mı?" },
          { id: "RA_P20", text: "Sızıntı ve Döküntüye karşı emici mat ve atık poşeti var mı?" },
          { id: "RA_P21", text: "Kimyasal maddelerin güvenlik bilgi formları sahada bulunuyor mu?" }
        ]
      },
      {
        section: "ÇALIŞMA ALANINDA ALINACAK ÖNLEMLER - Kazı Çalışmaları",
        items: [
          { id: "RA_P22", text: "Yer altı şebekesi (doğalgaz, su, elektrik) planlarına bakıldı mı?" },
          { id: "RA_P23", text: "Kazı çalışmaları sırasında göçme tehlikesine karşı önlem alındı mı?" }
        ]
      }
    ],
    customFields: [
      { id: "workTitle", label: "Yapılacak İşin Tanımı", type: "text" },
      { id: "location", label: "Çalışma Yapılacak Yer", type: "text" },
      { id: "startTime", label: "İşin Başlama Tarihi ve Saati", type: "datetime-local" },
      { id: "duration", label: "İşin Süresi", type: "text" }
    ]
  },
  SITE_AUDIT: {
    sections: [
      {
        section: "EKİPSEL MALZEME KONTROLÜ",
        items: [
          { id: "EQ_1", text: "Bara Topraklama (1 Adet)" },
          { id: "EQ_2", text: "YG Dedektörü" },
          { id: "EQ_3", text: "YG Topraklama Aparatı (2 Adet)" },
          { id: "EQ_4", text: "AG Topraklama Aparatı (2 Adet)" },
          { id: "EQ_5", text: "İlk Yardım Seti / Yanık Seti" },
          { id: "EQ_6", text: "Etiketleme - Kilitleme" },
          { id: "EQ_7", text: "Çevre Emniyet Ekipmanları" },
          { id: "EQ_8", text: "Yangın Söndürücü Cihaz" },
          { id: "EQ_9", text: "Tırmanma Ekipmanları (Sürgülü Merdiven, Ayakçak)" },
          { id: "EQ_10", text: "Haberleşme Cihazı" }
        ]
      },
      {
        section: "KİŞİSEL MALZEME KONTROLÜ",
        items: [
          { id: "PER_1", text: "Baret / Çene Bağı" },
          { id: "PER_2", text: "AG Dedektörü / Kontrol Kalemi" },
          { id: "PER_3", text: "Yüz Koruyucuları" },
          { id: "PER_4", text: "AG İzole Eldiven" },
          { id: "PER_5", text: "YG İzole Eldiven" },
          { id: "PER_6", text: "İş Ayakkabısı" },
          { id: "PER_7", text: "Paraşüt Tipi Emniyet Kemeri Seti" },
          { id: "PER_8", text: "Ark Başlığı / Ark Eldiveni" },
          { id: "PER_9", text: "İş Kıyafeti" },
          { id: "PER_10", text: "Ağaç Kesim Kıyafeti (Takım)" }
        ]
      }
    ],
    customFields: [
      { id: "firmName", label: "Firma Adı", type: "text" },
      { id: "region", label: "Denetlenen Bölge", type: "text" },
      { id: "operationName", label: "İşletme Adı", type: "text" },
      { id: "plateNumber", label: "Araç Plakası", type: "text" },
      { id: "workLocation", label: "Çalışma Yapılan Mevki", type: "text" },
      { id: "workDescription", label: "Yapılan İş", type: "text" },
      { id: "checkTime", label: "Denetleme Saati", type: "text" },
      { id: "sapNo", label: "SAP No", type: "text" },
      { id: "teamLeader", label: "Ekip Şefi Adı Soyadı", type: "text" },
      { id: "teamType", label: "Ekip Türü", type: "text" }
    ]
  },
  CONTRACTOR_AUDIT: {
    sections: [
      {
        section: "İşbaşı Belgeleri",
        items: [
          { id: "CC_1_1", text: "Çalışanların QR kodlu kimlik kartı var mı?" }
        ]
      },
      {
        section: "Kişisel Koruyucu Donanımlar",
        items: [
          { id: "CC_2_1", text: "Çalışanlarda işe uygun KKD mevcut mu? (Baret, iş ayakkabısı, paraşüt tipi emniyet kemeri vb.)" },
          { id: "CC_2_2", text: "Kullanılan KKD'ler uygun mu? (Standart, Deformasyon vb.)" },
          { id: "CC_2_3", text: "Yüklenici/Altyüklenici çalışanlarının yapacağı işe uygun iş kıyafeti mevcut mu?" }
        ]
      },
      {
        section: "AG/YG Elektrik İşleri Kontrol Kriterleri",
        items: [
          { id: "CC_3_1", text: "Çalışma yapılacak bölgenin enerjisi kesilmiş mi?" },
          { id: "CC_3_2", text: "Elektrik Kesme Protokolü düzenlenmiş mi?" },
          { id: "CC_3_3", text: "Enerji kesintisi ve topraklama yapıldıktan sonra YEDAŞ ve Yüklenici ile beraber Etiketleme Kilitleme yapılmış mı?" },
          { id: "CC_3_4", text: "Enerji kesintisi sonrası enerji kesilen hatta geliş ve gidiş yönünde Hat Topraklaması yapılmış mı?" }
        ]
      },
      {
        section: "Çalışma Alanı ve Çevre Güvenliği",
        items: [
          { id: "CC_4_1", text: "Çalışma yapılacak bölgede trafik ve yayaların girmesini engelleyici ve uyarıcı tedbirler alınmış mı? (Bariyer, duba, uyarı-ikaz işaretleri, flaşör, iş levhası, işaretçi vb.)" },
          { id: "CC_4_2", text: "Sahada bulunan malzemeler için uygun istifleme ve işaretleme yapılmış mı?" }
        ]
      },
      {
        section: "Genel Kontroller",
        items: [
          { id: "CC_5_1", text: "Yüksekte çalışma yapacak bölgede hava koşulları uygun mu?" },
          { id: "CC_5_2", text: "Yüksekte yapılacak çalışmalarda toplu koruma önlemlerine öncelik verilmiş mi? (Sepetli araç, dikey konumlandırma, yoyo kullanımı vb.)" },
          { id: "CC_5_3", text: "Yüksekte çalışma yapacak çalışanlara Yüksekte Çalışma Eğitimleri var mı?" },
          { id: "CC_5_4", text: "Emniyet Kemeri, Konumlandırma Lanyardı, Çift kollu lanyarda verilmiş mi?" },
          { id: "CC_5_5", text: "Beton direk merdiveninin kullanıldığı durumlarda, kullanılan merdivende Dikey Yaşam Hattı Sistemi var mı?" }
        ]
      },
      {
        section: "Makine-Ekipman Kullanımı",
        items: [
          { id: "CC_6_1", text: "Sepetli araç ile çalışma sırasında, Sepetli araç içerisine Paraşüt Tipi Emniyet Kemeri uygun şekilde takılacak bağlantı elemanları var ve sağlam mı?" },
          { id: "CC_6_2", text: "Sepetli Araç/Mobil vinç aydınlatma, denge ayakları, swiçleri vb aparatları çalışabilir durumda mı?" },
          { id: "CC_6_3", text: "Çalışma alanında kullanılacak Sepetli Araç/Mobil vinç çalışmaya başlamadan önce gerekli kontrolleri yapılmış mı? (Sapan, kanca, tambur, fren sistemi vb.)" },
          { id: "CC_6_4", text: "Direk montaj/demontaj işlerinde mobil vinç uygun şekilde kullanılıyor mu? Tüm destek ayakları açılmış mı? Gerekli alanlarda destek ayakları için takoz kullanılıyor mu?" },
          { id: "CC_6_5", text: "İş makinelerinin periyodik kontrolleri var mı?" },
          { id: "CC_6_6", text: "İş makinelerinin günlük kontrol formları var mı? Düzgün dolduruluyor mu?" },
          { id: "CC_6_7", text: "İş makinelerinde fiziksel arıza belirtileri var mı? (Yağ sızıntısı, deformasyon, gevşeme, çatlak vb.)" },
          { id: "CC_6_8", text: "Oksijen tüpü şaloma takımları ve basınç göstergeleri sağlam mı? Standartlara uygun mu?" },
          { id: "CC_6_9", text: "Yeterli yangın söndürme cihazı var mı? Kullanılabilir durumda mı? (İş makineleri, araçlar ve yapılan iş için gerekli çalışma alanında)" },
          { id: "CC_6_10", text: "İlkyardım çantası var mı? Kullanılabilir durumda mı?" }
        ]
      },
      {
        section: "Kazı Çalışmaları Kontrolü",
        items: [
          { id: "CC_7_1", text: "Kazı yapılacak alanda başka tesisatların olup olmadığı konusunda ilgili kurumlardan bilgi alınarak güvenli güzergah belirlemesi yapıldı mı? (Doğalgaz, su, elektrik vb.)" },
          { id: "CC_7_2", text: "Meskun mahallerde, insanların kapılarının önlerindeki geçişler için uygun platformlar/köprü var mı?" },
          { id: "CC_7_3", text: "Kazı yapılan yeraltı kablosu direk çukurları kapatılmış ve gerekli güvenlik tedbirleri alınmış mı?" }
        ]
      },
      {
        section: "Kaldırma- Taşıma - İletme İşlemleri",
        items: [
          { id: "CC_8_1", text: "Yük kaldırma ve taşıma yöntemi uygun mu? (İşaretçi, sapancı, iletişim araçları)" }
        ]
      },
      {
        section: "Çevre Yönetimi",
        items: [
          { id: "CC_9_1", text: "Sızıntı-döküntü önlemleri alınmış mı? Kimyasal atık kiti mevcut mu?" },
          { id: "CC_9_2", text: "Çalışma alanındaki demontaj veya atık malzemeler uygun şekilde istiflenerek ambarlara gönderilmiş mi?" },
          { id: "CC_9_3", text: "Kimyasallar uygun şekilde etiketlenmiş mi? Uygun taşınıyor mu?" }
        ]
      }
    ],
    customFields: [
      { id: "contractorCompany", label: "Yüklenici/Altyüklenici", type: "text" },
      { id: "projectName", label: "Proje Adı", type: "text" },
      { id: "workOperation", label: "İş/İşletmesi", type: "text" },
      { id: "authorizedPerson", label: "Yetkili Adı Soyadı", type: "text" },
      { id: "checkDateTime", label: "Tarih-Saat", type: "datetime-local" }
    ]
  }
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

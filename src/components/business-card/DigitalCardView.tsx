import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Contact2,
  Share2,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Globe,
  CreditCard,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  QrCode
} from 'lucide-react';

export const DigitalCardView: React.FC = () => {
  const { businessProfile, updateBusinessProfile } = useERP();

  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [copiedCardUrl, setCopiedCardUrl] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [ownerName, setOwnerName] = useState(businessProfile.ownerName);
  const [businessName, setBusinessName] = useState(businessProfile.businessName);
  const [tagline, setTagline] = useState(businessProfile.tagline);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [email, setEmail] = useState(businessProfile.email);
  const [address, setAddress] = useState(businessProfile.address);
  const [instagram, setInstagram] = useState(businessProfile.instagram);
  const [websiteUrl, setWebsiteUrl] = useState(businessProfile.websiteUrl);

  const cardShareUrl = `${window.location.origin}/card/${encodeURIComponent(businessProfile.businessName.toLowerCase().replace(/\s+/g, '-'))}`;

  const handleCopyBank = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBank(accNum);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleCopyCardUrl = () => {
    navigator.clipboard.writeText(cardShareUrl);
    setCopiedCardUrl(true);
    setTimeout(() => setCopiedCardUrl(false), 2000);
  };

  const handleDownloadVCard = () => {
    // Generate valid vCard (.vcf) format
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${businessProfile.ownerName} - ${businessProfile.businessName}`,
      `ORG:${businessProfile.businessName}`,
      `TITLE:${businessProfile.tagline}`,
      `TEL;TYPE=CELL,VOICE:${businessProfile.phone}`,
      `EMAIL:${businessProfile.email}`,
      `ADR;TYPE=WORK:;;${businessProfile.address};${businessProfile.city};;;`,
      `URL:${businessProfile.websiteUrl}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${businessProfile.businessName.replace(/\s+/g, '_')}_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      ownerName,
      businessName,
      tagline,
      phone,
      email,
      address,
      instagram,
      websiteUrl
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Kartu Nama Digital (Digital Business Card)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kartu nama interaktif dengan QR Code scannable, tautan WhatsApp, kontak vCard, dan rekening transfer bank.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Tutup Form' : 'Edit Profil Kartu'}</span>
          </button>

          <button
            onClick={handleDownloadVCard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download vCard (.vcf)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors printable-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>

      {/* Edit Form Modal/Drawer if open */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="no-print bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Edit Informasi Profil Kartu Nama
            </h3>
            <span className="text-xs text-slate-400">Perubahan tersimpan otomatis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik / Founder</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Usaha / Toko</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Slogan Usaha</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Bisnis</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Akun Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Fisik Usaha</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
            >
              Simpan Profil Kartu
            </button>
          </div>
        </form>
      )}

      {/* Digital Business Card Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Card Showcase */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="printable-document w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header Pattern / Visual Banner */}
            <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative p-4 flex items-start justify-between">
              <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">
                DIGITAL PASS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Profile Avatar & Identity */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={businessProfile.avatarUrl || '/src/assets/images/card_founder_avatar_1791062120473.jpg'}
                    alt={businessProfile.ownerName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* QR Code Scannable preview */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <svg className="w-16 h-16 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="24" height="24" rx="2" fill="#0f172a" />
                    <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="17" y="17" width="10" height="10" fill="#0f172a" />
                    <rect x="66" y="10" width="24" height="24" rx="2" fill="#0f172a" />
                    <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="73" y="17" width="10" height="10" fill="#0f172a" />
                    <rect x="10" y="66" width="24" height="24" rx="2" fill="#0f172a" />
                    <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                    <rect x="17" y="73" width="10" height="10" fill="#0f172a" />
                    <rect x="42" y="16" width="8" height="8" fill="#4f46e5" />
                    <rect x="42" y="32" width="8" height="8" fill="#0f172a" />
                    <rect x="22" y="44" width="8" height="8" fill="#0f172a" />
                    <rect x="48" y="48" width="12" height="12" fill="#0f172a" />
                    <rect x="68" y="44" width="8" height="8" fill="#4f46e5" />
                    <rect x="42" y="68" width="8" height="8" fill="#0f172a" />
                    <rect x="66" y="68" width="8" height="8" fill="#0f172a" />
                  </svg>
                  <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Scan Kartu
                  </span>
                </div>
              </div>

              {/* Name and Tagline */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {businessProfile.ownerName}
                </h2>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                  {businessProfile.businessName}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {businessProfile.tagline}
                </p>
              </div>

              {/* Quick Contact Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <a
                  href={`https://wa.me/62${businessProfile.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(businessProfile.businessName)},%20saya%20tertarik%20dengan%20produk%20Anda.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>

                <button
                  onClick={handleDownloadVCard}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Contact2 className="w-3.5 h-3.5" />
                  <span>Simpan Kontak</span>
                </button>
              </div>

              {/* Detailed Contact List */}
              <div className="mt-5 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center gap-3 pt-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="leading-snug">{businessProfile.address}</span>
                </div>

                <div className="flex items-center gap-3 pt-2 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{businessProfile.email}</span>
                </div>

                <div className="flex items-center gap-3 pt-2 text-slate-700">
                  <Instagram className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{businessProfile.instagram}</span>
                </div>

                <div className="flex items-center gap-3 pt-2 text-slate-700">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{businessProfile.websiteUrl}</span>
                </div>
              </div>

              {/* Bank Accounts for direct payment */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Nomor Rekening Pembayaran Resmi:</span>
                </p>

                <div className="space-y-2">
                  {businessProfile.bankAccounts.map((b) => (
                    <div
                      key={b.accountNumber}
                      className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{b.bank}</span>
                        <p className="font-mono text-slate-700">{b.accountNumber}</p>
                        <p className="text-[10px] text-slate-400">a.n {b.accountHolder}</p>
                      </div>

                      <button
                        onClick={() => handleCopyBank(b.accountNumber)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        {copiedBank === b.accountNumber ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Sharing & QR Code details */}
        <div className="no-print space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">
              Bagikan Kartu Nama Digital
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pelanggan cukup membuka tautan ini di browser smartphone mereka untuk menyimpan kontak Anda.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="truncate pr-2 font-mono text-[11px] text-slate-600">
                  {cardShareUrl}
                </span>
                <button
                  onClick={handleCopyCardUrl}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors shrink-0"
                  title="Salin Link Kartu"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {copiedCardUrl && (
                <p className="text-[11px] text-emerald-600 font-semibold text-center">
                  ✓ Link kartu nama digital berhasil disalin!
                </p>
              )}

              <button
                onClick={handleDownloadVCard}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Format Kontak Smartphone (.vcf)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

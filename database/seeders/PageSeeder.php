<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Syarat & Ketentuan',
                'slug' => 'terms-of-service',
                'status' => 'published',
                'is_system' => true,
                'meta_description' => 'Syarat dan ketentuan penggunaan layanan kami.',
                'content' => <<<'HTML'
<h2>1. Pendahuluan</h2>
<p>Selamat datang di <strong>[Nama Perusahaan]</strong>. Dengan mengakses dan menggunakan layanan kami, Anda menyetujui untuk terikat oleh syarat dan ketentuan berikut. Harap membaca ketentuan ini dengan saksama sebelum menggunakan layanan kami.</p>

<h2>2. Definisi</h2>
<ul>
    <li><strong>"Layanan"</strong> merujuk pada platform pendaftaran dan pengelolaan acara yang disediakan oleh [Nama Perusahaan].</li>
    <li><strong>"Pengguna"</strong> merujuk pada setiap individu yang mengakses atau menggunakan Layanan.</li>
    <li><strong>"Acara"</strong> merujuk pada kelas, workshop, seminar, atau kegiatan lainnya yang tersedia melalui Layanan.</li>
</ul>

<h2>3. Pendaftaran Acara</h2>
<p>Dengan mendaftar pada suatu acara melalui Layanan kami, Anda menyetujui bahwa:</p>
<ul>
    <li>Informasi yang Anda berikan adalah benar dan akurat.</li>
    <li>Anda bertanggung jawab untuk hadir pada acara yang telah Anda daftarkan.</li>
    <li>Pendaftaran bersifat personal dan tidak dapat dipindahtangankan tanpa persetujuan tertulis dari penyelenggara.</li>
</ul>

<h2>4. Pembayaran</h2>
<p>Seluruh pembayaran harus diselesaikan sesuai dengan metode dan tenggat waktu yang ditentukan pada saat pendaftaran. Pembayaran yang telah diterima akan diproses sesuai dengan kebijakan pengembalian dana kami.</p>

<h2>5. Kode Etik Peserta</h2>
<p>Peserta diharapkan untuk:</p>
<ul>
    <li>Menghormati instruktur, staf, dan peserta lainnya.</li>
    <li>Mengikuti aturan dan prosedur yang berlaku di lokasi acara.</li>
    <li>Menjaga kebersihan dan kerapihan fasilitas yang digunakan.</li>
</ul>

<h2>6. Pembatasan Tanggung Jawab</h2>
<p>[Nama Perusahaan] tidak bertanggung jawab atas cedera, kehilangan, atau kerusakan yang terjadi selama atau sebagai akibat dari partisipasi dalam acara, kecuali disebabkan oleh kelalaian berat dari pihak kami.</p>

<h2>7. Perubahan Ketentuan</h2>
<p>[Nama Perusahaan] berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif setelah dipublikasikan melalui Layanan kami.</p>

<h2>8. Kontak</h2>
<p>Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami melalui informasi kontak yang tersedia di halaman Hubungi Kami.</p>
HTML,
            ],
            [
                'title' => 'Kebijakan Privasi',
                'slug' => 'privacy-policy',
                'status' => 'published',
                'is_system' => true,
                'meta_description' => 'Kebijakan privasi mengenai pengumpulan dan penggunaan data pribadi Anda.',
                'content' => <<<'HTML'
<h2>1. Pendahuluan</h2>
<p>Kebijakan privasi ini menjelaskan bagaimana <strong>[Nama Perusahaan]</strong> mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.</p>

<h2>2. Informasi yang Kami Kumpulkan</h2>
<p>Kami mengumpulkan informasi berikut saat Anda menggunakan layanan kami:</p>
<ul>
    <li><strong>Informasi identitas:</strong> nama lengkap, alamat email, nomor telepon.</li>
    <li><strong>Informasi akun:</strong> data yang terkait dengan akun Google Anda jika menggunakan fitur masuk dengan Google.</li>
    <li><strong>Informasi transaksi:</strong> riwayat pendaftaran acara, detail pembayaran, dan penggunaan voucher.</li>
    <li><strong>Informasi teknis:</strong> alamat IP, jenis perangkat, dan data penggunaan situs.</li>
</ul>

<h2>3. Penggunaan Informasi</h2>
<p>Informasi yang kami kumpulkan digunakan untuk:</p>
<ul>
    <li>Memproses pendaftaran dan pembayaran acara.</li>
    <li>Mengirimkan konfirmasi, pengingat, dan informasi terkait acara.</li>
    <li>Mengelola program referral dan voucher.</li>
    <li>Meningkatkan kualitas layanan kami.</li>
    <li>Memenuhi kewajiban hukum yang berlaku.</li>
</ul>

<h2>4. Perlindungan Data</h2>
<p>Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses tidak sah, pengungkapan, perubahan, atau penghancuran.</p>

<h2>5. Berbagi Informasi</h2>
<p>Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Informasi dapat dibagikan kepada:</p>
<ul>
    <li>Penyelenggara acara yang Anda daftarkan, sejauh diperlukan untuk pelaksanaan acara.</li>
    <li>Penyedia layanan pihak ketiga yang membantu operasional kami (misalnya, pemrosesan pembayaran).</li>
    <li>Pihak berwenang jika diwajibkan oleh hukum.</li>
</ul>

<h2>6. Hak Anda</h2>
<p>Anda berhak untuk:</p>
<ul>
    <li>Mengakses dan memperbarui informasi pribadi Anda.</li>
    <li>Meminta penghapusan data pribadi Anda, dengan memperhatikan kewajiban hukum yang berlaku.</li>
    <li>Menarik persetujuan atas penggunaan data Anda.</li>
</ul>

<h2>7. Perubahan Kebijakan</h2>
<p>Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan dipublikasikan melalui layanan kami.</p>

<h2>8. Kontak</h2>
<p>Untuk pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui informasi kontak yang tersedia di halaman Hubungi Kami.</p>
HTML,
            ],
            [
                'title' => 'Kebijakan Pengembalian Dana',
                'slug' => 'refund-policy',
                'status' => 'published',
                'is_system' => true,
                'meta_description' => 'Kebijakan pengembalian dana dan pembatalan pendaftaran acara.',
                'content' => <<<'HTML'
<h2>1. Pembatalan oleh Peserta</h2>
<p>Peserta dapat membatalkan pendaftaran acara dengan ketentuan berikut:</p>
<ul>
    <li><strong>Lebih dari 7 hari sebelum acara:</strong> Pengembalian dana penuh (100%).</li>
    <li><strong>3–7 hari sebelum acara:</strong> Pengembalian dana sebesar 50%.</li>
    <li><strong>Kurang dari 3 hari sebelum acara:</strong> Tidak ada pengembalian dana.</li>
</ul>

<h2>2. Pembatalan oleh Penyelenggara</h2>
<p>Jika acara dibatalkan oleh penyelenggara, peserta berhak atas:</p>
<ul>
    <li>Pengembalian dana penuh (100%), atau</li>
    <li>Pemindahan pendaftaran ke acara pengganti dengan nilai setara.</li>
</ul>

<h2>3. Perubahan Jadwal</h2>
<p>Jika terjadi perubahan jadwal acara:</p>
<ul>
    <li>Peserta akan diberitahukan melalui email atau telepon.</li>
    <li>Peserta yang tidak dapat menghadiri jadwal baru berhak mengajukan pengembalian dana penuh.</li>
</ul>

<h2>4. Proses Pengembalian Dana</h2>
<p>Pengembalian dana akan diproses dalam waktu <strong>7–14 hari kerja</strong> setelah permintaan disetujui. Dana akan dikembalikan melalui metode pembayaran yang sama dengan saat pendaftaran.</p>

<h2>5. Pengecualian</h2>
<p>Kebijakan pengembalian dana ini tidak berlaku untuk:</p>
<ul>
    <li>Acara yang ditandai sebagai "non-refundable" pada saat pendaftaran.</li>
    <li>Ketidakhadiran tanpa pemberitahuan (no-show).</li>
</ul>

<h2>6. Cara Mengajukan Pengembalian Dana</h2>
<p>Untuk mengajukan pengembalian dana, silakan hubungi kami melalui halaman Hubungi Kami dengan menyertakan:</p>
<ul>
    <li>Nama lengkap dan alamat email yang terdaftar.</li>
    <li>Nama acara dan tanggal pendaftaran.</li>
    <li>Alasan pembatalan.</li>
</ul>
HTML,
            ],
            [
                'title' => 'Tentang Kami',
                'slug' => 'about-us',
                'status' => 'draft',
                'is_system' => false,
                'meta_description' => 'Kenali lebih dekat tentang kami dan layanan yang kami tawarkan.',
                'content' => <<<'HTML'
<h2>Siapa Kami</h2>
<p>[Deskripsikan perusahaan atau organisasi Anda di sini. Ceritakan tentang visi, misi, dan nilai-nilai yang menjadi landasan layanan Anda.]</p>

<h2>Visi & Misi</h2>
<p><strong>Visi:</strong> [Tuliskan visi Anda di sini.]</p>
<p><strong>Misi:</strong> [Tuliskan misi Anda di sini.]</p>

<h2>Mengapa Memilih Kami</h2>
<ul>
    <li>[Keunggulan pertama Anda.]</li>
    <li>[Keunggulan kedua Anda.]</li>
    <li>[Keunggulan ketiga Anda.]</li>
</ul>
HTML,
            ],
            [
                'title' => 'FAQ',
                'slug' => 'faq',
                'status' => 'draft',
                'is_system' => false,
                'meta_description' => 'Pertanyaan yang sering diajukan seputar layanan dan acara kami.',
                'content' => <<<'HTML'
<h2>Umum</h2>

<h3>Bagaimana cara mendaftar acara?</h3>
<p>Anda dapat mendaftar melalui halaman acara yang tersedia di situs kami. Pilih acara yang diinginkan, isi formulir pendaftaran, dan selesaikan pembayaran.</p>

<h3>Metode pembayaran apa saja yang tersedia?</h3>
<p>Kami menerima pembayaran melalui QRIS dan transfer bank manual. Detail pembayaran akan ditampilkan saat proses pendaftaran.</p>

<h3>Apakah saya akan mendapatkan konfirmasi setelah mendaftar?</h3>
<p>Ya, Anda akan menerima email konfirmasi setelah pendaftaran dan pembayaran Anda berhasil diverifikasi.</p>

<h2>Pembatalan & Pengembalian Dana</h2>

<h3>Bagaimana cara membatalkan pendaftaran?</h3>
<p>Silakan hubungi kami melalui halaman Hubungi Kami untuk mengajukan pembatalan. Ketentuan pengembalian dana berlaku sesuai dengan Kebijakan Pengembalian Dana kami.</p>

<h3>Berapa lama proses pengembalian dana?</h3>
<p>Pengembalian dana akan diproses dalam waktu 7–14 hari kerja setelah permintaan disetujui.</p>

<h2>Program Referral</h2>

<h3>Apa itu program referral?</h3>
<p>Program referral memungkinkan Anda mendapatkan diskon dengan mengajak teman untuk mendaftar acara melalui kode referral Anda.</p>

<h3>Bagaimana cara menggunakan kode referral?</h3>
<p>Masukkan kode referral pada saat proses pendaftaran untuk mendapatkan potongan harga sesuai ketentuan yang berlaku.</p>
HTML,
            ],
            [
                'title' => 'Hubungi Kami',
                'slug' => 'contact-us',
                'status' => 'draft',
                'is_system' => false,
                'meta_description' => 'Hubungi kami untuk pertanyaan, saran, atau bantuan lebih lanjut.',
                'content' => <<<'HTML'
<h2>Hubungi Kami</h2>
<p>Kami senang mendengar dari Anda. Jika Anda memiliki pertanyaan, saran, atau membutuhkan bantuan, jangan ragu untuk menghubungi kami melalui salah satu saluran berikut:</p>

<ul>
    <li><strong>Email:</strong> [alamat@email.com]</li>
    <li><strong>Telepon/WhatsApp:</strong> [+62xxx-xxxx-xxxx]</li>
    <li><strong>Alamat:</strong> [Alamat lengkap Anda]</li>
</ul>

<h2>Jam Operasional</h2>
<p>Senin – Jumat: 09.00 – 17.00 WIB<br>Sabtu: 09.00 – 13.00 WIB<br>Minggu & Hari Libur: Tutup</p>
HTML,
            ],
        ];

        foreach ($pages as $page) {
            Page::firstOrCreate(
                ['slug' => $page['slug']],
                $page,
            );
        }
    }
}

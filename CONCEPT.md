we want to build a simple event management for service industry like yoga class, etc like that, basically
it should be this simple : 

- it is simply create an event
    -> inside of that event we will had a catalog (generic term like for class, or session, whatever it name)
        -> and it will have an add-ons on top of that
    -> relation will be, 1 event, many catalog, 1 catalog many addons
    -> we will have dedicated crud for addons, then for crud catalog, on create it will map / include which addons we will use
    -> also apply the same for event, will map / include which catalog it will have
- catalog and addons will have strike_price, and price


any idea, regarding this concept? think dont code

---

feedback : 

- app-layout naming
- 


----

question : 

Berapa estimasi waktu yang Anda butuhkan termasuk slicing & integrasi api untuk membuat halaman login standar jika desain Figma telah tersedia? Apakah Menggunakan AI? Jika iya, tools berbasis AI apa yang Anda gunakan dalam proses pengerjaannya? (dijawab dengan penjelasan)

answer : 

tl;dr, semua hal yang berbasis how-to akan sangat mudah di kerjakan oleh ai-assisted programming, 1 - 2 jam saja bisa 
selesai, why? karena AI sudah lebih cepat dan lebih pintar untuk sekedar coding, jadi untuk jawaban nomer 1, saya bisa 
selesaikan 1 - 2 jam saja, bahkan bisa sambil saya tinggal bikin kopi. Akan tetapi jika permasalahan nya adalah 
'what-if'? eg: bagaimana membuat login yang bisa mendeteksi bot, pertimbangan celah keamanan, dst, maka tentu membutuhkan waktu yang lebih lama, karena butuh decision making yang walaupun nanti yang mengerjakan ai, tapi quality dan decision tetap di tangan manusia, maka saya punya push back untuk pertanyaan ini, apakah yang di maksud sekedar login, jika iya 1 - 2 jam saja, atau bahkan lebih cepat bisa saya kerjakan, akan tetapi jika tidak sekedar login, tentu membutuhkan waktu yang bervariasi tergantung kompelsitas


question : 

Jelaskan dan tunjukkan dalam share screen, fungsi atau implementasi kode paling kompleks yang pernah Anda tangani serta peran Anda dalam pengerjaannya (tunjukkan codenya di line berapa).

answer : 

pushback : yang di maksud kompleks disini apa? apakah banyak-nya flow / business process, atau kerumitan algoritma,
asumsi saya disini adalah kerumita algoritma, maka berikut saya tunjukkan work stealing algorithm yang baru saya kerjakan, disclaimer, saya memilih ini karena ini adalah satu - satu nya yang bisa saya tunjukkan tanpa NDA



----

we just had a new inquiry from adonara cafe, here is the info that you can just judge, and lets have a chat about this, because i had some 
tought, you need have a pushback and hardcall : 

- i just had this inquiry via faris, a guy that sit on same programming whatsapp group
- basically it is still on bidding phase, meaning we dont have 100% chance to won
- what adonara want is basically A-Z, meaning start from landing page / company profile, even mention about POS, etc like that, here is the 
summary of voice notes from faris : 

"notes: bean roastery, transaksi manual, pengen scale up, 2 platform, web + mobile, web compro + cta ke wa / shopee, pos, dst.., mobile seperti fore, pengen proposal -> timeline, dst.., masih bidding"

- what interesting is, i can cut development time, because for that compro + cta ke wa, i already had, for that pos, and anything else 
that will takes time
- so i think instead of fixing price, i think it will be more good if retainer mode, but i think we need to elaborate more
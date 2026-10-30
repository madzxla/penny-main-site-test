import VideoScrub from "./components/Home";
import LegalPage from "./components/LegalPage";

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/privacy") {
    return (
      <LegalPage
        title="Privātuma politika"
        introduction="Pēdējo reizi atjaunots 2026. gada 29. oktobrī.

        Šeit tiks aprakstīts, kā Penny (turpmāk ''mēs'') vāc, izmanto un glabā personas datus, kā arī kā vari izmantot savas datu aizsardzības tiesības.
        Šī privātuma politika attiecas uz mūsu lietotni un mājaslapu, kas pieejama vietnē getpenny.lv.

        <b>1. Datu vākšana un izmantošana</b>
         Mēs vācam un saglabājam sekojošos datus, lai nodrošinātu mūsu pakalpojumus.
         · <b>Telefona numurs</b> - Nepieciešams lietotnes reģistrācijai, autentifikācijai un pakalpojuma drošības nolūkiem. Mēs izmantosim telefona numuru, lai nosūtītu 5-ciparu SMS kodu, kas ļauj mums pārbaudīt Jūsu identitāti.
         · <b>E-pasta adrese</b> - Ja Jūs pieteicāties saņemt jaunumus, mēs izmantosim Jūsu e-pasta adresi, lai nosūtītu mūsu piedāvāto saturu. E-pasta adrese un pieteikšanās jaunumiem nav nepieciešama lietotnes lietošanai.

        <b>2. Datu glabāšana un aizsardzība</b>
          Mēs glabājam Jūsu personas datus drošos serveros un ievērojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu datus pret nesankcionētu piekļuvi, izpaušanu vai iznīcināšanu.
          Jūsu dati tiek saglabāti Amazon Web Services (AWS) drošajos serveros Apvienotajā Karalistē, Londonā.
          Datu aizsardzības pārkāpuma gadījumā, mēs nekavējoties noteiksim problēmu, atrisināsim to un informēsim Jūs un attiecīgās iestādes, kā to nosaka piemērojamie datu aizsardzības likumi.

        <b>3. Lietotāja tiesības</b>
          Lietotājiem ir tiesības piekļūt saviem personas datiem, labot tos, pieprasīt to dzēšanu un ierobežot to apstrādi. Lai izmantotu šīs tiesības, lietotāji var sazināties ar mums, izmantojot norādīto kontaktinformāciju 6. nodaļā. (''Kontaktēt mūs'')

        <b>4. Sīkdatnes</b>
          Apmeklējot mūsu mājaslapu, mēs varam izmantot sīkdatņu tehnoloģijas, lai uzlabotu Jūsu un citu lietotāju pieredzi apmeklējot mūsu mājaslapu un lai novērstu tehniskas kļūmes.
          Jūs esat brīvi atteikties no sīkdatnēm. Jums nav iespējams atteikties no dažām sīkdatnēm, kas ir nepieciešamas mūsu mājaslapas darbībai.

        <b>5. Izmaiņas privātuma politikā</b>
          Mēs paturam tiesības mainīt šo privātuma politiku jebkurā laikā. Izmaiņas stāsies spēkā pēc to publicēšanas vietnē. Lietotāji tiek aicināti regulāri pārskatīt privātuma politiku, lai būtu informēti par jebkādām izmaiņām.

        <b>6. Kontaktēt mūs</b>
          Ja Jums ir jebkādi jautājumi par šo privātuma politiku vai par Penny, mēs lūdzam Jums sazināties ar mums caur e-pasta adresi legal@getpenny.lv.
        "
      />
    );
  }

  if (path === "/terms") {
    return (
      <LegalPage
        title="Lietošanas noteikumi"
        introduction="
        Pēdējo reizi atjaunots 2026. gada 29. oktobrī.

        Šeit tiks aprakstīti Penny (turpmāk ''mēs'') pakalpojuma lietošanas nosacījumi, tostarp lietotāju pienākumi un noteikumi par piedāvājumu izmantošanu.
        Šīe lietošanas noteikumi attiecas uz mūsu lietotni un mājaslapu, kas pieejama vietnē getpenny.lv.

        <b>1. Konti</b>
          · Lai izmantotu mūsu lietotni, Jums ir nepieciešams izveidot kontu, izmantojot savu tālruņa numuru.
          · Jūs esat atbildīgs par sava konta drošību un par visām darbībam, kas tiek veiktas Jūsu kontā. Mēš neesam atbildīgi par jebkādām darbībam, kas tiek veiktas Jūsu konta ietvaros.
          · Mums ir tiesības jebkurā laikā apturēt vai izdzēst Jūsu kontu, ja tiek konstatēti lietošanas noteikumu pārkāpumi.
          · Vienai fiziskai personai ir atļauts izveidot tikai vienu kontu. Konta dalīšana ar citiem lietotājiem nav atļauta.
         
         <b>2. Godīga lietošāna</b>
          Dalība norādītajās aktivitātes ir stingri aizliegta.
          · Izmantot mūsu lietotni, lai veiktu jebkādas nelikumīgas darbības, tostarp, bet ne tikai, krāpšanu, naudas atmazgāšanu vai citu Latvijas Republikas likumu pārkāpšanu
          · Censties piekļūt pakalpojumam bez konta un atļaujas, mēģināt apiet kontu autentifikāciju un drošības pasākumus.
          · Censties piekļūt pakalpojuma serveriem, datu bāzēm vai citiem resursiem, kas nav paredzēti lietotājiem.

          <b>3. Piedāvājumi</b>
          · Par piedāvājumu izsniegšanu un akurātas informācijas nodrošināšanu ir atbildīgs tikai norādītais uzņemums, kas piedāvā konkrēto piedāvājumu. Mēs neesam atbildīgi par piedāvājumu saturu, pieejamību vai citām problēmam, kas radās no piedāvājuma organizatora neuzmanības vai nolaidības dēļ.
          · Katrai fiziskai personai, kurai pieder derīgs konts, ir atļauts izmantot katru piedāvājumu tikai vienu reizi. Piedāvājuma atkārtota izmantošāna izmantojot alternatīvus kontus ir stingri aizliegta.
          · Lai saņemtu piedāvājumu, lietotājam ir jānorāda savs apstiprinājuma kods uzņēmuma darbiniekam, kuram tas ir jāapstiprina.

          <b>4. Atbildība</b>
          · Mēs neesam atbildīgi par jebkādām zaudējumiem, kas radušies no lietotnes lietošanas vai nespējas to izmantot.
          · Mēs neesam atbildīgi par jebkādām problēmām, kas radušās no piedāvājumu organizatoru nolaidības vai neuzmanības dēļ.

        <b>5. Izmaiņas lietošanas noteikumos</b>
          Mēs paturam tiesības mainīt šos lietošanas noteikumus jebkurā laikā. Izmaiņas stāsies spēkā pēc to publicēšanas vietnē. Lietotāji tiek aicināti regulāri pārskatīt lietošanas noteikumus, lai būtu informēti par jebkādām izmaiņām.

        <b>6. Kontaktēt mūs</b>
          Ja Jums ir jebkādi jautājumi par šiem lietošanas noteikumiem vai par Penny, mēs lūdzam Jums sazināties ar mums caur e-pasta adresi legal@getpenny.lv.
          "
      />
    );
  }

  return (
    <main>
      <VideoScrub />
    </main>
  );
}

export default App;
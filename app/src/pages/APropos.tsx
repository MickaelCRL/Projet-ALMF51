import React from "react";

/**
 * Page "À propos" minimaliste qui n'affiche qu'un PDF fourni.
 * - Passe un chemin/URL absolue ou relative via la prop `pdfUrl`.
 * - Optionnel : `title` pour l'entête (par défaut "À propos").
 * Exemple : <APropos pdfUrl="/apropos.pdf" />
 */



const APropos: React.FC<AProposProps> = () => {
  return (
    <main className={`min-h-screen flex flex-col bg-white text-gray-900 ${className ?? ""}`}>
     

      {/* Zone d'affichage du PDF, prend tout l'espace restant */}
      <section className="flex-1">
        <div className="w-full h-[calc(100vh-4.5rem)]">
          {/* Essai 1 : <object> natif PDF */}
          <object data={"../../public/rapport.pdf"} type="application/pdf" className="w-full h-full">
            {/* Essai 2 (fallback) : <embed> */}
            <embed src={"../../public/rapport.pdf" + "#toolbar=1&zoom=page-width"} type="application/pdf" className="w-full h-full" />

            {/* Essai 3 (dernier recours) : message + lien téléchargement */}
            <div className="p-6 space-y-3">
              <p>Votre navigateur ne peut pas afficher ce document PDF.</p>
              <p>
                <a href={"../../public/rapport.pdf"} target="_blank" rel="noreferrer" className="underline">
                  Télécharger le PDF
                </a>
              </p>
            </div>
          </object>
        </div>
      </section>
    </main>
  );
};

export default APropos;

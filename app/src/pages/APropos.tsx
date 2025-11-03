import React from "react";

const APropos: React.FC = () => {
  return (
    <main className="w-screen h-screen flex flex-col bg-gray-50 text-gray-900">
      

      {/* Conteneur PDF plein écran */}
      <section className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="w-full h-full">
          <object
            data="/rapport.pdf"
            type="application/pdf"
            className="w-full h-full"
          >
            <embed
              src="/rapport.pdf#toolbar=1&zoom=page-width"
              type="application/pdf"
              className="w-full h-full"
            />
            <div className="p-6 space-y-3 text-center bg-white">
              <p>Votre navigateur ne peut pas afficher ce document PDF.</p>
              <p>
                <a
                  href="/rapport.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
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

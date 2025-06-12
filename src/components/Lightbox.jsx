"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MicroModal from "micromodal";

let initialized = false;

export default function Lightbox({ src, alt, id = "lightbox-modal", className = "" }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (!initialized) {
            initialized = true;
            MicroModal.init({
                awaitOpenAnimation: true,
                awaitCloseAnimation: true,
                disableScroll: true
            });
        }
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        MicroModal.show(id);
    };

    if (!mounted) return null;

    return (
        <>
            <a href="#" onClick={handleClick}>
                <img src={src} alt={alt} className={className} />
            </a>

            {createPortal(
                <div
                    id={id}
                    className="modal micromodal-slide fixed inset-0 z-50 flex items-center justify-center"
                    aria-hidden="true"
                >
                    <div
                        className="modal__overlay fixed inset-0 bg-black/60 flex items-center justify-center"
                        data-micromodal-close
                        tabIndex={-1}
                    >
                        <div
                            className="modal__container bg-white p-6 rounded relative max-w-3xl w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`${id}-title`}
                        >
                            <button
                                className="modal__close absolute top-2 right-2 text-xl"
                                aria-label="Close modal"
                                data-micromodal-close
                            >
                                ×
                            </button>
                            <div className="modal__content max-h-[80vh] overflow-auto">
                                <h2 id={`${id}-title`} className="sr-only">Image preview</h2>
                                <img src={src} alt={alt} className="max-w-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

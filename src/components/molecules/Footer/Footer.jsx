import React from 'react';
import styles from './Footer.module.scss';

const FOOTER_LINKS = [
    {
        label: 'Website',
        href: 'https://stability.nexus',
    },
    {
        label: 'Docs',
        href: 'https://docs.stability.nexus/djed-stablecoin-protocols/djed-overview',
    },
    {
        label: 'GitHub',
        href: 'https://github.com/DjedAlliance/Djed-Solidity',
    },
    {
        label: 'Discord',
        href: '#', // Replace with actual Discord invite link
    },
    {
        label: 'X',
        href: '#', // Replace with actual X/Twitter profile
    },
    {
        label: 'LinkedIn',
        href: '#', // Replace with actual LinkedIn page
    },
];

export default function Footer() {
    return (
        <footer className={styles.footer} aria-label="Site footer">
            <div className={styles.container}>
                <div className={styles.copyright}>
                    © 2025 The Stable Order
                </div>
                <nav className={styles.links} aria-label="Footer navigation">
                    {FOOTER_LINKS.map((link, index) => (
                        <React.Fragment key={link.label}>
                            {index > 0 && <span className={styles.separator} aria-hidden="true">·</span>}
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                {link.label}
                            </a>
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </footer>
    );
}

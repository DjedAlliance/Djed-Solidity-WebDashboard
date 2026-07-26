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
    // Placeholder links - uncomment and add real URLs when available
    // {
    //     label: 'Discord',
    //     href: 'https://discord.gg/your-invite-link',
    // },
    // {
    //     label: 'X',
    //     href: 'https://x.com/your-profile',
    // },
    // {
    //     label: 'LinkedIn',
    //     href: 'https://linkedin.com/company/your-page',
    // },
];

export default function Footer() {
    // Filter out any placeholder or invalid links
    const validLinks = FOOTER_LINKS.filter(link => link.href && link.href !== '#' && link.href.startsWith('http'));

    return (
        <footer className={styles.footer} aria-label="Site footer">
            <div className={styles.container}>
                <div className={styles.copyright}>
                    © 2025 The Stable Order
                </div>
                <nav className={styles.links} aria-label="Footer navigation">
                    {validLinks.map((link, index) => (
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

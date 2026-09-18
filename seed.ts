// Seed script — pre-populate Sanity with initial content
// Run: npx sanity exec seed.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const documents = [
  {
    "_type": "siteSettings",
    "_id": "siteSettings",
    "siteName": "Rocky Mountain Wireline Service",
    "ctaLabel": "Get Started",
    "ctaUrl": "/contact",
    "contactEmail": "theron.chepko@rmws.com",
    "contactPhone": "",
    "contactAddress": "",
    "copyrightText": "© 2026 Rocky Mountain Wireline Service. All rights reserved."
  },
  {
    "_type": "page",
    "_id": "page-home",
    "title": "Home",
    "slug": {
      "_type": "slug",
      "current": "/"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0",
        "title": "Rocky Mountain Wireline Service",
        "subtitle": ""
      },
      {
        "_type": "contactSection",
        "_key": "contactSection-1",
        "email": "theron.chepko@rmws.com"
      },
      {
        "_type": "processSteps",
        "_key": "processSteps-2"
      },
      {
        "_type": "splitSection",
        "_key": "splitSection-3"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-about",
    "title": "About",
    "slug": {
      "_type": "slug",
      "current": "/about"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      },
      {
        "_type": "textContent",
        "_key": "textContent-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-contact",
    "title": "Contact",
    "slug": {
      "_type": "slug",
      "current": "/contact"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      },
      {
        "_type": "contactSection",
        "_key": "contactSection-1",
        "email": "theron.chepko@rmws.com"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-services",
    "title": "Services",
    "slug": {
      "_type": "slug",
      "current": "/services"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      },
      {
        "_type": "portfolioSection",
        "_key": "portfolioSection-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-equipment",
    "title": "Equipment",
    "slug": {
      "_type": "slug",
      "current": "/equipment"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      },
      {
        "_type": "featureGrid",
        "_key": "featureGrid-1"
      },
      {
        "_type": "statsSection",
        "_key": "statsSection-2"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-safety",
    "title": "Safety",
    "slug": {
      "_type": "slug",
      "current": "/safety"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      },
      {
        "_type": "featureGrid",
        "_key": "featureGrid-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-employment",
    "title": "Employment",
    "slug": {
      "_type": "slug",
      "current": "/employment"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0"
      }
    ]
  },
  {
    "_type": "legalPage",
    "_id": "legal-privacy-policy",
    "title": "Privacy Policy",
    "slug": {
      "_type": "slug",
      "current": "/privacy-policy"
    }
  },
  {
    "_type": "legalPage",
    "_id": "legal-terms-and-conditions",
    "title": "Terms & Conditions",
    "slug": {
      "_type": "slug",
      "current": "/terms-and-conditions"
    }
  },
  {
    "_type": "legalPage",
    "_id": "legal-accessibility",
    "title": "Accessibility Statement",
    "slug": {
      "_type": "slug",
      "current": "/accessibility"
    }
  },
  {
    "_type": "legalPage",
    "_id": "legal-cookie-policy",
    "title": "Cookie Policy",
    "slug": {
      "_type": "slug",
      "current": "/cookie-policy"
    }
  },
  {
    "_type": "navigation",
    "_id": "nav-main",
    "navType": "main",
    "items": [
      {
        "_key": "home",
        "label": "Home",
        "url": "/"
      },
      {
        "_key": "about",
        "label": "About",
        "url": "/about"
      },
      {
        "_key": "contact",
        "label": "Contact",
        "url": "/contact"
      },
      {
        "_key": "services",
        "label": "Services",
        "url": "/services"
      },
      {
        "_key": "equipment",
        "label": "Equipment",
        "url": "/equipment"
      },
      {
        "_key": "safety",
        "label": "Safety",
        "url": "/safety"
      },
      {
        "_key": "employment",
        "label": "Employment",
        "url": "/employment"
      }
    ]
  },
  {
    "_type": "navigation",
    "_id": "nav-legal",
    "navType": "legal",
    "items": [
      {
        "_key": "privacy-policy",
        "label": "Privacy Policy",
        "url": "/privacy-policy"
      },
      {
        "_key": "terms-and-conditions",
        "label": "Terms & Conditions",
        "url": "/terms-and-conditions"
      },
      {
        "_key": "accessibility",
        "label": "Accessibility Statement",
        "url": "/accessibility"
      },
      {
        "_key": "cookie-policy",
        "label": "Cookie Policy",
        "url": "/cookie-policy"
      }
    ]
  }
]

async function seed() {
  console.log(`Seeding ${documents.length} document(s)...`)
  const transaction = client.transaction()
  for (const doc of documents) {
    transaction.createIfNotExists(doc)
  }
  await transaction.commit()
  console.log('Seed complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})

# Content Guide

This guide is for anyone who needs to update the Isentropic Robotics
website's content: blog posts, board members, events, research write-ups,
products, and volunteer roles. It does not assume you have used a
terminal, installed any software, or written Markdown before. Every term
that might be unfamiliar is explained the first time it appears.

If you get partway through a procedure and something does not match what
you see on screen, stop and ask a developer before saving. It is much
easier to fix a change before it is saved than after.

## How the site is organized

The website is built from plain text files kept in a **repository** — an
online project folder on GitHub, a website for storing and tracking
changes to files. You do not need to know anything about GitHub beyond
what is in this guide: how to open a file, change its text, and save
("commit") that change.

Each kind of content — blog posts, board members, events, and so on —
lives in its own folder. Inside each folder is a **template file**, named
starting with an underscore, for example `_TEMPLATE.md`. A template is a
blank starting point: it has every field you need to fill in, with
comments explaining each one, and placeholder text such as "Replace with
..." marking what to change. Files that start with an underscore are
never shown on the live site, so the template itself stays invisible no
matter how long it sits there.

Every content file is written in **Markdown**, a simple way of marking up
plain text so it turns into a formatted webpage: for example, a line
starting with `#` becomes a heading, and a line starting with `-` becomes
a bullet point. The [Writing inside a post](#task-11-writing-inside-a-blog-post-body)
section near the end of this guide covers the Markdown you are likely to
need.

Every content file starts with a block between two `---` lines. This is
called **frontmatter**: a short list of `field: value` pairs that hold
the structured information about the entry — its title, its date, and so
on — separate from the free-form writing that follows. Every procedure
below tells you exactly which frontmatter fields to fill in.

Once you save a change on GitHub, the live site rebuilds itself
automatically, usually within a few minutes. You do not need to notify
anyone or run any command for the change to go live.

## Editing or adding a file on GitHub

Every procedure in this guide asks you to open, copy, or create a file.
Here is how to do each of those, in the website's repository on
GitHub.com:

**To open an existing file:**
1. In the repository, click through the folders until you reach the
   file (the exact folder path is given in each procedure below).
2. Click the file's name to open it.
3. Click the pencil icon in the top-right corner of the file view to
   start editing.

**To create a new file by copying the template:**
1. Open the template file (`_TEMPLATE.md`) in the relevant folder, as
   above.
2. Click the pencil icon to edit it, select all of its text, and copy it.
3. Go back to the folder, click "Add file," then "Create new file."
4. Give the new file a name (each procedure below explains how to choose
   one) ending in `.md`, and paste the copied template text into it.
5. Replace the placeholder text as instructed, then continue to the next
   step below.

**To save any change, new file or edit:**
1. Scroll to the bottom of the page.
2. In the box asking for a commit message, write one short sentence
   describing the change (for example, "Add August update post").
3. Click "Commit changes" (or "Propose changes" if you do not have
   direct write access — a developer will then need to approve it before
   it goes live).

## Task 1: Add a blog post

**Folder:** `src/content/blog/`
**Template:** `_TEMPLATE.md` in that folder

1. Create a new file in `src/content/blog/` by copying the template, as
   described above. Name it starting with today's date, in
   `YYYY-MM-DD-` format, followed by a few words describing the post,
   all lowercase and separated by hyphens — for example,
   `2026-09-03-fall-kickoff-recap.md`. The date in the file name does not
   have to match the `date` field exactly, but keeping them the same
   avoids confusion.
2. Fill in the frontmatter fields:
   - `title`: the headline, shown on index cards and at the top of the
     article.
   - `date`: the publication date, in `YYYY-MM-DD` format.
   - `summary`: one or two sentences shown beneath the title on index
     cards.
   - `tier`: the card's visual style. Choose exactly one, from this
     table:

     | `tier` value | Use it for | How it looks |
     | --- | --- | --- |
     | `major` | Product releases and full camp updates | Black border, hard shadow |
     | `progress` | Progress updates | Soft grey border |
     | `standard` | Everything else | No border |

   - `topics`: which pages this post also appears on, in addition to the
     homepage. Choose any combination of `community`, `research`, and
     `product` — or leave it as `[]` (empty) to show the post only on the
     homepage. **A single post can carry more than one topic.** For
     example, `topics: [community, product]` makes one file appear on
     both the Community page and the Products page, with no need to
     write or copy the post a second time. This is intentional: write
     the post once, and list every page it belongs on.
   - `draft`: leave this as `true` while you are still working (see Task
     2 below), and change it to `false` when the post is ready to
     publish.
3. Below the second `---` line, write the post body in Markdown. See
   Task 11 for the Markdown basics.
4. Save the file as described above. If `draft` is `false`, the post
   goes live on the next automatic rebuild.

## Task 2: Mark a post as a work in progress

Setting `draft: true` in a blog post's frontmatter hides it completely:
it gets no page of its own, does not appear in any list of posts, and is
left out of the site's subscription feed. This lets you start writing a
post well before it is ready and save your progress at any point without
it appearing on the live site by accident.

There is a real example of this in the repository already, at
`src/content/blog/2026-08-20-fall-build-season-preview.md` — open it to
see what an in-progress post looks like.

1. Open the post's file, as described above.
2. Find the `draft` field in the frontmatter and set it to `true`.
3. Save the file. The post disappears from the live site (or never
   appears, if it was never published) until you change `draft` back to
   `false`.

## Task 3: Add a board member

**Folder:** `src/content/board/`
**Template:** `_TEMPLATE.md` in that folder

1. Create a new file in `src/content/board/` by copying the template.
   Name it after the person, all lowercase and separated by hyphens —
   for example, `jane-doe.md`.
2. Fill in the frontmatter:
   - `name`: full name, as it should appear on their card.
   - `role`: their title on the board, shown beneath the name.
   - `photo`: leave this for now if you do not yet have a photo file in
     place — see Task 4, which covers adding the image and setting this
     field together.
   - `alt`: a plain-language description of the photo, for people using
     a screen reader and for anyone whose browser fails to load the
     image. Describe the person, not the file name — for example,
     "Headshot of Jane Doe smiling outdoors." This field is required.
   - `order`: a whole number controlling where this person's card
     appears on the board grid — lower numbers appear first. Pick a
     number not already used by another board member.
3. Below the frontmatter, write the person's bio paragraph in Markdown.
4. Save the file.

## Task 4: Replace a headshot (or add one for a new board member)

**Folder for the image:** `public/images/board/`

Board photos are cropped to a square automatically and displayed at a
fixed size on the page, so you can use a photo of any size or shape —
a portrait, a landscape crop, anything — without breaking the layout.
The photo files currently in place are simple placeholder graphics; any
of them can be replaced with a real photograph at any time.

1. In `public/images/board/`, click "Add file," then "Upload files," and
   upload the new photo. Common formats such as `.jpg` and `.png` both
   work.
2. Open the board member's content file in `src/content/board/` (see
   Task 3 for naming), and set the `photo` field to the uploaded file's
   path, starting with `/images/board/` — for example,
   `/images/board/jane-doe.jpg`. This must match the uploaded file's name
   exactly, including its extension (the letters after the last dot,
   such as `.jpg`).
3. Make sure the `alt` field still accurately describes the new photo,
   and update it if it does not.
4. Save the file. You may also delete the old, now-unused image file
   from `public/images/board/`, though leaving it in place causes no
   harm.

## Task 5: Add an event

**Folder:** `src/content/events/`
**Template:** `_TEMPLATE.md` in that folder

1. Create a new file in `src/content/events/` by copying the template.
   Name it starting with the event's date in `YYYY-MM-DD-` format,
   followed by a short description — for example,
   `2026-10-04-fall-scrimmage.md`.
2. Fill in the frontmatter:
   - `title`: the event's name.
   - `date`: when it took place (or will take place), `YYYY-MM-DD`.
   - `location`: where it was or will be held.
   - `summary`: one or two sentences shown in the collapsed row on the
     Community page.
3. Below the frontmatter, write the expanded detail in Markdown —
   attendance, partner organizations, outcomes. This text only appears
   once a visitor clicks to expand the row.
4. Save the file.

## Task 6: Add a research entry

**Folder:** `src/content/research/`
**Template:** `_TEMPLATE.md` in that folder

1. Create a new file in `src/content/research/` by copying the template.
   Name it after the research topic, lowercase and hyphenated — for
   example, `wheel-traction-study.md`.
2. Fill in the frontmatter:
   - `title`: the paper or project's title.
   - `date`: publication or completion date, `YYYY-MM-DD`.
   - `authors`: a list, one name per line, of everyone who worked on it.
     At least one name is required.
   - `abstract`: one paragraph summarizing the work, shown in the
     collapsed row.
   - `synopsis`: a shorter, plain-language version of the abstract,
     shown alongside it.
   - `manuscriptAvailable`: whether visitors can ask for the full
     write-up. Set this to `true` to show a request form on the entry,
     or to `false` to hide that form — for example, while the full
     write-up is still being finalized.
3. Below the frontmatter, write the extended detail in Markdown: methods,
   results, and references.
4. Save the file.

## Task 7: Add a product

**Folder:** `src/content/products/`
**Template:** `_TEMPLATE.md` in that folder

1. Create a new file in `src/content/products/` by copying the template.
   Name it after the product, lowercase and hyphenated — for example,
   `gearbox-v3.md`.
2. Fill in the frontmatter:
   - `title`: the product's name.
   - `kind`: exactly one of `hardware` or `software`. This decides which
     of the two groups the product is listed under on the Products page
     (hardware is listed first, then software).
   - `status`: a short status label, such as "In development,"
     "Released," or "Retired."
   - `summary`: one or two sentences shown on the index card.
   - `links`: an optional list of related links, each with a `label`
     and a `url`. Leave this as `[]` if there are none yet; the template
     shows the format to use if you do have some.
3. Below the frontmatter, write the expanded detail in Markdown:
   specifications, requirements, documentation.
4. Save the file.

## Task 8: Open and close a volunteer role

**Folder:** `src/content/roles/`
**Template:** `_TEMPLATE.md` in that folder

To add a new role, create a new file in `src/content/roles/` by copying
the template, name it after the role (lowercase, hyphenated — for
example, `web-volunteer.md`), and fill in `title`, `category`,
`location`, and `commitment`. Write the responsibilities and
qualifications in Markdown below the frontmatter.

To retire a role that is no longer accepting applicants, **do not delete
its file.** Instead:

1. Open the role's file.
2. Set `open` to `false`.
3. Save the file. The role disappears from the Contribute page's listing
   and from the application form's role menu, but the file — and its
   history — stays in the repository, ready to be reopened later by
   setting `open` back to `true`.

**A warning about the `order` field.** Every role has an `order` field, a
whole number that controls its position on the page. Roles are first
sorted by this number *across every role on the whole site*, and only
then grouped into their category sections (Engineering, Education, and
so on) — the category sections themselves appear in whatever order their
first role lands in after that site-wide sort. In practice, this means
changing one role's `order` number does not just move that role within
its own category — a very low or very high number can shift its entire
category section earlier or later on the page. If you want to reorder
roles within one category without disturbing the others, change their
`order` numbers by small amounts relative to each other, and check the
Contribute page afterward to confirm the category sections still appear
in the order you expect.

## Task 9: Replace the sponsor packet PDF

**File:** `public/files/isentropic-sponsor-packet.pdf`

1. In `public/files/`, click on `isentropic-sponsor-packet.pdf`.
2. Click "Add file" in that folder, then "Upload files," and upload the
   new PDF using the exact same file name,
   `isentropic-sponsor-packet.pdf`. Uploading a file with the same name
   replaces the old one.
3. Save. There is nothing else to update — the "Sponsor packet (PDF, ...
   KB)" file size shown next to the download link on the Contribute page
   is calculated automatically from the file itself, so it will reflect
   the new file's size the next time the site rebuilds.

## Task 10: Where form submissions arrive

The site has three forms: sponsor inquiries, manuscript requests, and
volunteer applications. All submissions are collected by Netlify (the
service that hosts the site) and are not stored in the repository at
all — there is no file to check.

To view them, or to set up an email notification whenever a form is
submitted, log in to the Netlify dashboard, open this site, and go to its
**Forms** section. Notification emails (who receives them, and for which
forms) are configured there as well. A developer can help set this up
the first time if you do not already have Netlify access.

## Task 11: Writing inside a post body

Everything below a file's frontmatter is written in Markdown, a way of
formatting plain text using a few punctuation characters instead of a
toolbar. Here is what is available:

- **Headings:** start a line with one or more `#` characters. `## A
  heading` makes a large heading; `### A smaller heading` makes a
  smaller one. Start with `##`, not `#` — the page's own title already
  uses a single `#` and every section inside your writing should be one
  level below it.
- **Lists:** start each line with `-` for a bulleted list, or `1.`,
  `2.`, `3.` for a numbered one.
- **Tables:** write them using the Markdown table syntax shown here:

  ```
  | Column one | Column two |
  | --- | --- |
  | Row one, cell one | Row one, cell two |
  | Row two, cell one | Row two, cell two |
  ```

  **Always build tables this way — do not paste in a table copied from
  Word, Google Docs, or a webpage.** A pasted table usually carries
  hidden HTML formatting that looks fine on a computer screen but will
  not scroll properly on a phone; only a table written in Markdown
  syntax, like the example above, gets the site's automatic
  scroll-on-narrow-screens treatment.
- **Code:** wrap a short piece of code or a technical term in single
  backticks, like `` `this` ``. For a longer block of code, put three
  backticks on their own line before and after it.
- **Links:** write `[the text people click](the web address)` — for
  example, `[our sponsor packet](https://example.org/packet.pdf)`.
- **Quotes:** start a line with `>` to set it apart as a quotation.

If you are ever unsure how something will look, save your change with
`draft: true` set (for a blog post) and check the page before turning
`draft` off, or ask a developer to preview it with you.

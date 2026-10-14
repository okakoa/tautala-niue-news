I'm back. Can you read our Project CONFIGURATION.md, SUMMARY.md and IMPLEMENTATION_PLAN.md files and give me a brief run down just so we are on the same page before we start. Do NOT read any files in the my_files folder.
----------------------------------------------------------------------------------------------------------------------
Can you read the most recent Implementation Plan on "Backup Firebase Data Locally (Outside Google Ecosystem)"? This is what I wanted start implementing
----------------------------------------------------------------------------------------------------------------------
This concerns only the Mobile app: Can you have a look at the Edit&Contribute text edit field in the Mobile version of the app. When I delete character by character going right to left and after deleting the last character in the edit field the screen switch back to the home screen. I'm expecting the cursor to stay at the beggining of the edit field for me to start typing text.
----------------------------------------------------------------------------------------------------------------------
I got to get some sleep, can you update the User Guides with the new frontend edit features and also the Project Summary file. After that, run the local database backup then push the project backup to GitHub. Thank you!

----------------------------------------------------------------------------------------------------------------------

To automatically post to a Facebook Page, we will need a **Facebook Page Access Token** and your **Facebook Page ID**. 

Here is how we will build this feature:
1. We will create a secure backend API route (`/api/social/facebook`) that takes a published article, extracts the first three paragraphs, formats a link to your site, and sends it to the Facebook Graph API.
2. We will trigger this API automatically when a moderator clicks "Approve & Publish Now", and also from your backend cron job when a scheduled article goes live.

While I start writing the code for this backend logic, you will need to generate the Facebook credentials. Do you already have a Facebook Developer App and a **Page Access Token** ready, or would you like me to provide a step-by-step guide on how to generate them?
----------------------------------------------------------------------------------------------------------------------
When you create your test Facebook Page, you will also need to go to developers.facebook.com and do the following:

Create a new App (Type: Business).
Add the Facebook Login for Business product to the app.
Use the Graph API Explorer to generate a Page Access Token for your new test page.
Make sure you grant the pages_manage_posts and pages_read_engagement permissions.
Take all the time you need, and just reply here with the Page ID and the Page Access Token whenever you're ready!
----------------------------------------------------------------------------------------------------------------------
Auto-post only seen in the account that created the News Niue Facebook page!

The reason only you can see it right now is Meta's Development Mode sandbox rule:

When a developer app is first created, it is set to "In Development" mode by default.
In Development mode, Meta only shows API-generated posts to the App Admin / Developer (your account) so you can safely test without broadcasting to the public before you're ready.
How to Make Posts Visible to the Entire Public (Switch to "Live Mode")
Whenever you are ready to make posts visible to everyone in the world:

Go to developers.facebook.com and open your app (New Niue Auto Post).
At the top of the screen (in the header bar), look for the toggle switch that says: App Mode: In development
Click the toggle to switch it to Live.
(If prompted):
Privacy Policy URL: Meta usually asks for a link to a privacy policy (you can provide your website link e.g. https://.../privacy or your main site URL).
Category: Select News & Media or Business & Pages.
Click Save Changes / Switch Mode.
As soon as the app is switched to Live Mode, every article posted will immediately be visible to the general public, followers of the Page, and anyone visiting the News Niue Facebook Page!
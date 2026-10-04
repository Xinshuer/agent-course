---
name: image-prompt
description: Turn a short image request into a detailed, structured prompt for the Wan image model, and handle edits that use reference images. Read it before every image generation or image edit.
---

# Image prompt writer / 图像提示词

## 1. Decide the image type first

Pick one type, because each type is described differently:

| Type | Focus on |
|---|---|
| Photo / realistic | lens, shot size, real lighting, material texture |
| Illustration / anime | art style, line work, colour palette |
| Product / poster | layout, empty space, clean background |
| Scene / landscape | depth, weather, time of day |

## 2. Fill in the formula

prompt = subject (who / what, appearance, action) + scene (place, time, weather) + style + shot (shot size, camera angle) + lighting + mood

- Be concrete: "a knight in silver armour riding a white horse" instead of "a knight".
- One main subject per image unless the user asks for more.
- Do not write text that should appear inside the image unless the user asks for it.

## 3. Editing with reference images

- Pass the previous image path in `reference_images`.
- In the prompt, say what to keep ("keep the same knight, horse and background") and what to change ("replace the helmet with a black top hat").
- To combine images (e.g. a cat from one image and a dog from another), pass both paths and describe how they appear together.

## 4. Check the result

After generating, call `read_image` on the new file. If it does not match the request, rewrite the prompt and generate again (at most 2 retries), then tell the user the file path and the prompt you used.

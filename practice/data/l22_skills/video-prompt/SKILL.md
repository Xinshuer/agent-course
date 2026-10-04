---
name: video-prompt
description: Plan a short video, prepare its reference images and first frame, and write the video prompt for the Wan reference-to-video model. Read it before every video request.
---

# Video prompt and workflow / 视频提示词与流程

The video tool needs at least one image, so always prepare images first.

## Workflow

1. Split the video into 1-3 shots (shot 1, shot 2, ...). For each shot note: what happens, camera movement, mood.
2. List what must look consistent across shots: the main character(s) and the main scene.
3. Generate reference images with the image tool (follow the image-prompt skill):
   - one image per main character (clear, full body, plain background),
   - one image of the main scene,
   - one first-frame image that already shows the character inside the scene, matching shot 1.
4. Check every image with `read_image`. Regenerate any image that does not fit, before making the video.
5. Call `video_generate` with the first frame, the reference images, `duration` 5 and the video prompt.
6. Tell the user where the images and the video were saved.

## Video prompt formula

For each shot: subject + action + scene + camera movement (push in, pan, follow) + lighting + mood.
Write the shots in order, for example: "Shot 1: ... Shot 2: ...".
Keep it under 150 words.

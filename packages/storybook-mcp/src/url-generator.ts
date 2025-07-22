import kebabCase from "just-kebab-case";

export function generateStorybookUrl(
  host: string,
  title: string,
  storyName: string,
): string {
  // Convert title: MyTest/SomeText -> mytest-sometext
  const convertedTitle = title
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\s+/g, "");

  // Convert story name from camelCase to kebab-case: MyStoryName -> my-story-name
  const convertedStoryName = kebabCase(storyName);

  // Generate the id: mytest-sometext--my-story-name
  const id = `${convertedTitle}--${convertedStoryName}`;

  return `${host}/iframe.html?globals=&args=&id=${id}&viewMode=story`;
}

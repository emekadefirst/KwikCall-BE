import fs from 'fs/promises';
import path from 'path';

export async function getTemplate(templateName: string, data: Record<string, any>): Promise<string> {
  // import.meta.dir is the folder containing THIS file
  // We use '../' or simple naming to find the 'templates' folder relative to this script
  const filePath = path.join(import.meta.dir, 'templates', `${templateName}.html`);

  try {
    let content = await fs.readFile(filePath, 'utf8');

    // Simple regex to replace {{key}} with data[key]
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      // Ensure the value is converted to a string
      const value = data[key] !== undefined ? String(data[key]) : "";
      content = content.replace(regex, value);
    });

    return content;
  } catch (error: any) {
    // This will log the EXACT path that failed so you can see the fix in the logs
    console.error(`❌ Template not found at: ${filePath}`);
    throw error;
  }
}
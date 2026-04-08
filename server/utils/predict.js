const { exec } = require('child_process');
const path = require('path');
const User = require('../models/User');

async function predictDisease(imagePath, userId) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../predict.py');

    const command = `python "${scriptPath}" "${imagePath}"`;

    exec(command, async (error, stdout, stderr) => {
      if (stderr && stderr.trim()) {
        console.warn('Python stderr (non-fatal):', stderr.trim());
      }
      if (error) {
        console.error('Execution error:', error.message);
        return reject(error.message);
      }

      let parsed;
      try {
        parsed = JSON.parse(stdout.trim());
      } catch (e) {
        console.error('Invalid model output:', stdout);
        return reject('Model returned invalid output');
      }

      if (parsed.error) {
        return reject(parsed.error);
      }

      const predictionLabel = parsed.label;
      const confidence = parsed.confidence;
      const top3 = parsed.top3;

      try {
        const user = await User.findById(userId);

        if (!user) {
          return reject("User not found");
        }

        const normalizedImagePath = imagePath.includes('\\uploads\\')
          ? `/uploads/${path.basename(imagePath)}`
          : imagePath;

        user.records.push({
          imagePath: normalizedImagePath,
          prediction: predictionLabel,
          date: new Date()
        });

        await user.save();

        resolve({ prediction: predictionLabel, confidence, top3 });

      } catch (err) {
        console.error('DB error:', err.message);
        reject(err.message);
      }
    });
  });
}

module.exports = { predictDisease };

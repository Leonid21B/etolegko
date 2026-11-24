const { performance } = require('node:perf_hooks');
const readline = require('node:readline/promises');

async function main() {
  const input = readline.createInterface({ input: process.stdin, output: process.stdout });
  let address;
  try {
    address = (await input.question('Введите HTTP(S)-адрес: ')).trim();
  } finally {
    input.close();
  }

  const url = new URL(address);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Поддерживаются только адреса HTTP и HTTPS');
  }

  let totalBytes = 0;
  let totalTime = 0;

  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Запрос ${i + 1}: HTTP ${response.status}`);
    }

    for await (const chunk of response.body) {
      totalBytes += chunk.byteLength;
    }
    totalTime += performance.now() - start;
  }

  console.log(`Среднее время запроса: ${(totalTime / 10).toFixed(2)} мс`);
  console.log(`Общий объём данных: ${totalBytes} байт`);
  console.log(`Скорость скачивания: ${(totalBytes / 1024 / 1024 / (totalTime / 1000)).toFixed(2)} МиБ/с`);
}

try {
  main();
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
}


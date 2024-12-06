const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/cardapio', async (req, res) => {
    try {
        const { restaurante } = req.body;
        
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        
        const page = await browser.newPage();
        
        // Acessar o site da FUMP
        await page.goto('https://fump.ufmg.br/cardapio-do-dia/');
        
        // Esperar pelo seletor do restaurante e selecionar a opção
        await page.waitForSelector('#restaurante');
        await page.select('#restaurante', restaurante);
        
        // Esperar pelo carregamento do cardápio
        await page.waitForSelector('.cardapio-container');
        
        // Extrair os dados do cardápio
        const cardapio = await page.evaluate(() => {
            const container = document.querySelector('.cardapio-container');
            const items = container.querySelectorAll('.cardapio-item');
            
            return Array.from(items).map(item => ({
                tipo: item.querySelector('.tipo')?.textContent.trim(),
                prato: item.querySelector('.prato')?.textContent.trim(),
                descricao: item.querySelector('.descricao')?.textContent.trim()
            }));
        });
        
        await browser.close();
        res.json({ success: true, data: cardapio });
        
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao buscar cardápio' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

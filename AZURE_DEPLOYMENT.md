# Azure App Service Deployment Guide

This guide will help you deploy Skills Ready to Azure App Service.

## Prerequisites

1. An Azure subscription
2. Azure CLI installed (or use Azure Portal)
3. GitHub repository access (for automated deployments)

## Deployment Options

### Option 1: Deploy via Azure Portal (Recommended for first-time)

1. **Create an Azure App Service**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Web App"
   - Fill in the details:
     - Resource Group: Create new or select existing
     - Name: `skills-navigator-[your-name]` (must be globally unique)
     - Publish: **Code**
     - Runtime stack: **Node 22 LTS**
     - Operating System: **Linux** or **Windows**
     - Region: Select nearest to you
     - Pricing Plan: Choose based on your needs (B1 Basic is good to start)
   - Click "Review + Create" → "Create"

2. **Configure Deployment**
   - Once created, go to your App Service
   - Navigate to "Deployment Center" in the left menu
   - Select "GitHub" as the source
   - Authorize GitHub and select:
     - Organization: `robbwells-mct`
     - Repository: `skills-navigator`
     - Branch: `main`
   - Click "Save"

3. **Set up GitHub Secrets** (if using GitHub Actions workflow)
   - In your Azure App Service, go to "Deployment Center"
   - Download the Publish Profile
   - In GitHub, go to your repository → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `AZURE_WEBAPP_NAME`: Your app service name
     - `AZURE_WEBAPP_PUBLISH_PROFILE`: Paste the downloaded publish profile content

4. **Deploy**
   - The GitHub Actions workflow will automatically deploy on push to main
   - Or manually trigger from GitHub Actions tab

### Option 2: Deploy via Azure CLI

1. **Install Azure CLI** (if not already installed)
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Create Resource Group** (if needed)
   ```bash
   az group create --name skills-navigator-rg --location eastus
   ```

4. **Create App Service Plan**
   ```bash
   az appservice plan create --name skills-navigator-plan --resource-group skills-navigator-rg --sku B1 --is-linux
   ```

5. **Create Web App**
   ```bash
   az webapp create --resource-group skills-navigator-rg --plan skills-navigator-plan --name skills-navigator-yourname --runtime "NODE:22-lts"
   ```

6. **Deploy the application**
   ```bash
   # Build the app first
   npm run build
   
   # Deploy from local dist folder
   az webapp up --name skills-navigator-yourname --resource-group skills-navigator-rg --src-path ./dist
   ```

### Option 3: Deploy via VS Code Extension

1. **Install Azure App Service Extension**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "Azure App Service"
   - Install the extension

2. **Sign in to Azure**
   - Click the Azure icon in the left sidebar
   - Sign in to your Azure account

3. **Deploy**
   - Build your app: Run `npm run build` in terminal
   - Right-click the `dist` folder
   - Select "Deploy to Web App"
   - Select your subscription
   - Select "Create new Web App"
   - Enter a unique name
   - Select Node 22 LTS runtime
   - Wait for deployment to complete

## Post-Deployment Configuration

### Configure Application Settings

In Azure Portal → Your App Service → Configuration → Application Settings:

1. **Add Node version** (if needed)
   - Name: `WEBSITE_NODE_DEFAULT_VERSION`
   - Value: `22-lts`

2. **Enable Always On** (for production)
   - Configuration → General Settings
   - Toggle "Always On" to On

3. **Set up Custom Domain** (optional)
   - Custom domains → Add custom domain
   - Follow the instructions to verify and configure

### Monitor Your App

1. **Application Insights** (recommended)
   - Go to your App Service → Application Insights
   - Enable Application Insights
   - View metrics, logs, and performance data

2. **Log Stream**
   - Go to Monitoring → Log stream
   - View real-time logs

3. **Diagnose and solve problems**
   - Built-in diagnostic tool for troubleshooting

## Accessing Your App

Your app will be available at:
- `https://[your-app-name].azurewebsites.net`

## Troubleshooting

### Build fails
- Check Node version matches (22 LTS)
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### App doesn't start
- Check logs in Log Stream
- Verify `web.config` is deployed
- Check Application Settings for correct Node version

### Static files not loading
- Ensure build output is in `dist` folder
- Check `web.config` rewrite rules
- Verify MIME types are configured

## Updating Your App

With GitHub Actions configured:
1. Make changes to your code
2. Commit and push to main branch
3. GitHub Actions automatically builds and deploys

Without GitHub Actions:
1. Build: `npm run build`
2. Deploy: Use Azure CLI or VS Code extension

## Cost Management

- Monitor costs in Azure Cost Management
- Use Basic (B1) or Free (F1) tier for testing
- Scale up/down as needed in App Service Plan

## Security Best Practices

1. Enable HTTPS only (On by default)
2. Set minimum TLS version to 1.2
3. Configure CORS if needed
4. Use Application Insights for monitoring
5. Regularly update dependencies

## Support

For issues:
1. Check Azure App Service documentation
2. Review Application Insights logs
3. Check GitHub Actions workflow logs
4. Review Azure App Service diagnostics

---

Your Skills Ready app is now ready for Azure deployment! 🚀

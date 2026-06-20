using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RiftSiege
{
    public sealed class GameWindow : Form
    {
        private readonly WebView2 browser = new WebView2();

        public GameWindow()
        {
            Text = "Splinterlands: Rift Siege";
            BackColor = Color.FromArgb(9, 13, 18);
            WindowState = FormWindowState.Maximized;
            MinimumSize = new Size(900, 600);
            StartPosition = FormStartPosition.CenterScreen;
            KeyPreview = true;

            browser.Dock = DockStyle.Fill;
            Controls.Add(browser);
            Shown += StartGame;
            KeyDown += HandleKeys;
        }

        private async void StartGame(object sender, EventArgs e)
        {
            try
            {
                string userData = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory, "userdata");
                CoreWebView2Environment environment =
                    await CoreWebView2Environment.CreateAsync(null, userData);
                await browser.EnsureCoreWebView2Async(environment);

                browser.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                browser.CoreWebView2.Settings.AreDevToolsEnabled = false;
                browser.CoreWebView2.Settings.IsStatusBarEnabled = false;

                string game = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "game", "index.html");
                browser.Source = new Uri(game);
                browser.Focus();
            }
            catch (Exception error)
            {
                DialogResult choice = MessageBox.Show(
                    "Rift Siege needs Microsoft Edge WebView2, normally included with Windows 10 and 11.\n\n" +
                    "Would you like to open Microsoft's WebView2 download page?\n\n" + error.Message,
                    "Unable to start Rift Siege",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Error);
                if (choice == DialogResult.Yes)
                    Process.Start("https://developer.microsoft.com/microsoft-edge/webview2/");
                Close();
            }
        }

        private void HandleKeys(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F11)
            {
                FormBorderStyle = FormBorderStyle == FormBorderStyle.None
                    ? FormBorderStyle.Sizable
                    : FormBorderStyle.None;
                WindowState = FormWindowState.Maximized;
            }
        }
    }

    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new GameWindow());
        }
    }
}

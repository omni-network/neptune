pub mod router;
pub mod state;

use clap::Parser;
use state::NeptuneState;
use std::error::Error;
use std::fmt::Write;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use yansi::Paint;

const BANNER: &str = r#"
         _             _            _        _      _                  _             _
        /\ \     _    /\ \         /\ \     /\ \   /\_\               /\ \     _    /\ \
       /  \ \   /\_\ /  \ \       /  \ \    \_\ \ / / /         _    /  \ \   /\_\ /  \ \
      / /\ \ \_/ / // /\ \ \     / /\ \ \   /\__ \\ \ \__      /\_\ / /\ \ \_/ / // /\ \ \
     / / /\ \___/ // / /\ \_\   / / /\ \_\ / /_ \ \\ \___\    / / // / /\ \___/ // / /\ \_\
    / / /  \/____// /_/_ \/_/  / / /_/ / // / /\ \ \\__  /   / / // / /  \/____// /_/_ \/_/
   / / /    / / // /____/\    / / /__\/ // / /  \/_// / /   / / // / /    / / // /____/\
  / / /    / / // /\____\/   / / /_____// / /      / / /   / / // / /    / / // /\____\/
 / / /    / / // / /______  / / /      / / /      / / /___/ / // / /    / / // / /______
/ / /    / / // / /_______\/ / /      /_/ /      / / /____\/ // / /    / / // / /_______\
\/_/     \/_/ \/__________/\/_/       \_\/       \/_________/ \/_/     \/_/ \/__________/
"#;

#[derive(Debug, Parser, Clone)]
#[clap(name = "Neptune", version = "0.0.1")]
pub struct Config {
    #[clap(
        long,
        short,
        help = "Port number to listen on",
        default_value = "1738",
        value_name = "NUM"
    )]
    pub port: u16,

    #[clap(
        long,
        help = "The host the server will listen on",
        value_name = "IP_ADDR",
        help_heading = "SERVER OPTIONS"
    )]
    pub host: Option<IpAddr>,
}

#[derive(Debug)]
pub struct App {
    pub port: u16,
    pub host: IpAddr,
}

impl App {
    pub async fn new(cfg: Config) -> App {
        let host = cfg.host.unwrap_or(IpAddr::V4(Ipv4Addr::LOCALHOST));
        Self {
            port: cfg.port,
            host,
        }
    }

    pub async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        let addr = SocketAddr::new(self.host, self.port);

        let s = NeptuneState::new(addr);
        let r = router::init(s);

        println!("{}", self.info());

        axum::Server::bind(&addr)
            .serve(r.into_make_service())
            .await
            .unwrap();
        Ok(())
    }

    fn info(&self) -> String {
        let mut config_string: String = "".to_owned();
        let _ = write!(config_string, "\n{}", Paint::blue(BANNER));
        let _ = write!(config_string, "\n{:#?}", self);
        config_string
    }
}
